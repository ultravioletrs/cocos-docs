# Developer Guide

## Getting CoCos

1. Fork the [CoCos repository](https://github.com/ultravioletrs/cocos) to your GitHub account.
2. Clone your fork:

   ```shell
   git clone <your-fork-url> $SOMEPATH/cocos
   cd $SOMEPATH/cocos
   ```

## Build Environment

The project uses Go and Protocol Buffers. Make sure the following tools are installed:

- [Go](https://go.dev/doc/install) 1.25 or later
- [Protocol Buffers](https://grpc.io/docs/languages/go/quickstart/)
- [GNU Make](https://www.gnu.org/software/make/)
- [QEMU-KVM](https://www.qemu.org/) for running local VMs
- Optional: [Buildroot](https://buildroot.org/) when building the HAL image

### Building All Services

Run `make` in the repository root to compile the Agent, CLI and Manager. Artifacts are placed in the `build` directory. You can also build a single component:

```shell
make cli      # produces ./build/cocos-cli
make manager  # produces ./build/cocos-manager
make agent    # produces ./build/cocos-agent
```

### Building the HAL Image

The HAL is a minimal Linux distribution used inside the confidential VM. To build it, clone Buildroot and run:

```shell
git clone https://github.com/buildroot/buildroot.git
cd buildroot
git checkout 2025.08-rc3
make BR2_EXTERNAL=../cocos/hal/linux cocos_defconfig
make menuconfig    # optional, for additional configuration
make
```

The kernel image and root filesystem appear in `buildroot/output/images`. Copy `bzImage` and `rootfs.cpio.gz` to `cmd/manager/img` when testing locally.

### Testing the HAL Image

After building, you can boot a VM that runs the Agent using QEMU. Substitute the paths for your system:

```shell
sudo find / -name OVMF_CODE.fd
OVMF_CODE=/usr/share/OVMF/OVMF_CODE.fd
sudo find / -name OVMF_VARS.fd
OVMF_VARS=/usr/share/OVMF/OVMF_VARS.fd

KERNEL=buildroot/output/images/bzImage
INITRD=buildroot/output/images/rootfs.cpio.gz
IGVM=svsm/bin/coconut-qemu.igvm
ENV_PATH=<path>/<to>/<env_directory>
CERT_PATH=<path>/<to>/<cert_directory>

sudo qemu-system-x86_64 \
    -enable-kvm \
    -cpu EPYC-v4 \
    -machine q35 \
    -smp 4,maxcpus=16 \
    -m 8G,slots=5,maxmem=30G \
    -netdev user,id=vmnic,hostfwd=tcp::7022-:7002 \
    -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,romfile= \
    -machine confidential-guest-support=sev0,memory-backend=ram1,igvm-cfg=igvm0 \
    -object memory-backend-memfd,id=ram1,size=8G,share=true,prealloc=false,reserve=false \
    -object sev-snp-guest,id=sev0,cbitpos=51,reduced-phys-bits=1 \
    -object igvm-cfg,id=igvm0,file=$IGVM \
    -kernel $KERNEL \
    -append "console=null quiet" \
    -initrd $INITRD \
    -nographic \
    -monitor pty \
    -monitor unix:monitor,server,nowait \
    -fsdev local,id=env_fs,path=$ENV_PATH,security_model=mapped \
    -device virtio-9p-pci,fsdev=env_fs,mount_tag=env_share \
    -fsdev local,id=cert_fs,path=$CERT_PATH,security_model=mapped \
    -device virtio-9p-pci,fsdev=cert_fs,mount_tag=certs_share
```

The default login password is `root`.

### Testing the Agent Independently

With a VM running, the Agent waits for connection to a computations management server via gRPC. You can start the Agent independently for testing:

```shell
cd cocos

AGENT_CVM_GRPC_URL=<cvms_server_host:port>\
AGENT_CVM_GRPC_CLIENT_CERT=<path-to-client-cert> \
AGENT_CVM_GRPC_CLIENT_KEY=<path-to-client-key> \
AGENT_CVM_GRPC_SERVER_CA_CERT=<path-to-server-ca-cert> \
go run cmd/agent/main.go \
  -algo-path <path-to-algorithm> \
  -public-key-path <path-to-public-key> \
  -attested-tls-bool <true|false> \
  -data-paths <comma-separated-data-paths> \
  -client-ca-file <path-to-client-ca-file> \
  -ca-url <ca-url-if-attestedTLS-true> \
  -cvm-id <cvm-id-if-attestedTLS-true>
```

Agent, once up, will attempt to connect to the computations management server on the `AGENT_CVM_GRPC_URL`. If agent and the computations management server are running on the same host, the local ip address of the server will suffice. If the agent is running inside the vm, the public ip address of the computations management server (available on the internet) needs to be provided for agent to be able to connect to it.

Using localhost as the `AGENT_CVM_GRPC_URL` will only work if agent is running outside a vm, and the computations server is running on the local host. If agent is running inside the vm, using localhost will fail.

A running computations management server is required for the Agent to function. The Agent will connect to the server and wait for a computation manifest. Instructions for running a test computations management server are provided in the [CVMs server documentation](/docs/getting-started.md#run-the-server).

### Testing the Manager

A simple gRPC server is provided under `test/cvms/main.go` for development. Start it with the instructions in the [CVMs server documentation](/docs/getting-started.md#run-the-server).

Create `img` and `tmp` directories inside `cmd/manager` and copy the built kernel and rootfs there. Then run the Manager:

```shell
cd cmd/manager
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_GRPC_URL=localhost:7002 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_USE_SUDO=false \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_SEV_SNP_CBITPOS=51 \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
./build/cocos-manager
```

Manager will start a gRPC server and wait for client connections which can be used to create and manage vms. More information on how to run manager can be found in the [Manager docs](/docs/manager.md).

### Manager Environment Configuration

When running under systemd or via `make run`, the Manager reads variables from
`/etc/cocos/cocos-manager.env`. This file defines gRPC options and numerous
`MANAGER_QEMU_*` settings controlling the VM image, memory size and CPU
parameters. Adjust these values before starting the service if custom resources
or ports are required.

Example entries from `cocos-manager.env`:

```shell
# Manager Service Configuration
MANAGER_GRPC_PORT=6101
MANAGER_GRPC_HOST=0.0.0.0

# QEMU Configuration
MANAGER_QEMU_MEMORY_SIZE=25G
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd
```

### Running Manager as a Service

The repository provides a systemd unit at `init/systemd/cocos-manager.service`.
Install the binary, configuration and unit file with:

```shell
sudo make install_service
```

Start the Manager via systemd:

```shell
sudo systemctl start cocos-manager.service
```

You can also run `make run` to install the service and immediately start it.

## Code Generation

Whenever `.proto` files are modified, regenerate the Go sources with:

```shell
make protoc
```

Mocks for unit tests rely on method signatures. Refresh them after interface changes:

```shell
make mocks
```

---

## Building a Custom Computation Management Server

To integrate with CoCos agents, implement a gRPC server that conforms to the [`cvms.proto`](https://github.com/ultravioletrs/cocos/blob/main/agent/cvms/cvms.proto) interface.

The core method to implement is:

```proto
rpc Process(stream ClientStreamMessage) returns (stream ServerStreamMessage);
```

This is a **bi-directional streaming RPC** where the **client (CoCos agent)** and the **server (your control plane)** exchange messages continuously over a long-lived connection.

### Server-Side Requests

The server sends the following messages to the agent:

- **`ComputationRunReq`**:  
  Triggers execution of a new computation. Includes details of the computation and datasets required.

- **`RunReqChunks`**:  
  Used to stream large payloads (e.g., binaries or configs). Sent in sequence before the computation starts.

- **`AgentStateReq`**:  
  Requests a snapshot of the agent's current state.

- **`StopComputation`**:  
  Instructs the agent to stop a running computation gracefully.

- **`DisconnectReq`**:  
  Tells the agent to close the current connection, to terminate a cvm.

### Agent-Side Responses

The agent responds with the following messages:

- **`RunResponse`**:  
  Acknowledges receipt and execution of a computation run. Includes the computation id and error, if present.

- **`AgentLog`**:  
  Streams runtime logs from the agent, useful for observability and debugging.

- **`AgentEvent`**:  
  Reports events of the processes carried out by the agent during the computation.

- **`AttestationResponse`**:  
  Provides cryptographic proof of a trusted execution environment.

- **`StopComputationResponse`**:  
  Confirms that a stop request was honored and the computation terminated.

### Example Handler in Go

```go
func (s *server) Process(stream cvms.Service_ProcessServer) error {
  for {
    msg, err := stream.Recv()
    if err != nil {
      return err
    }

    switch m := msg.Message.(type) {
    case *cvms.ClientStreamMessage_RunRes:
      handleRunResponse(m.RunRes)
    case *cvms.ClientStreamMessage_Attestation:
      validateAttestation(m.Attestation)
    // Handle other types accordingly
    }

    // Example request: ask for agent state
    _ = stream.Send(&cvms.ServerStreamMessage{
      Message: &cvms.ServerStreamMessage_AgentStateReq{
        AgentStateReq: &cvms.AgentStateReq{Id: "agent-1"},
      },
    })
  }
}
```

### Hints

- Use **chunked messages (`RunReqChunks`)** for large uploads.
- Maintain **connection health** by periodically sending `AgentStateReq` or heartbeat pings.

---

## Running Tests

Execute all unit tests across packages with:

```shell
go test ./...
```

Run `make mocks` first if new interfaces were introduced.

## Troubleshooting

Zombie `qemu-system-x86_64` processes can linger after failed runs. Remove them with:

```shell
pkill -f qemu-system-x86_64
```

If any remain visible in `ps aux | grep qemu-system-x86_64`, terminate them manually with `kill -9 <PID>`.

Check the Manager service status with:

```shell
sudo systemctl status cocos-manager.service
```

View recent logs or follow output using `journalctl`:

```shell
journalctl -u cocos-manager.service
```

## Repository Structure

- `agent/` – Agent service code and gRPC definitions
- `cmd/` – Entry points for CLI, Agent and Manager binaries
- `hal/` – Hardware Abstraction Layer build files
- `manager/` – Manager service, QEMU helpers and API definitions
- `scripts/` – Build scripts such as the attestation policy helper
- `test/` – Manual test harnesses and sample servers

## Contributing

1. Create a feature branch in your fork.
2. Ensure `make` completes successfully and `go test ./...` passes.
3. Open a pull request with a detailed description of your changes.

## Further Documentation

Additional guides and design documents are available on the [official documentation site](https://docs.cocos.ultraviolet.rs) and in component `README` files.
