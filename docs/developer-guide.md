# Developer Guide

## Getting CoCos

1. Fork the [CoCos repository](https://github.com/ultravioletrs/cocos) to your GitHub account.
2. Clone your fork:
   ```bash
   git clone <your-fork-url> $SOMEPATH/cocos
   cd $SOMEPATH/cocos
   ```

## Build Environment

The project uses Go and Protocol Buffers. Make sure the following tools are installed:

- [Go](https://go.dev/doc/install) 1.20 or later
- [Protocol Buffers](https://grpc.io/docs/languages/go/quickstart/)
- [GNU Make](https://www.gnu.org/software/make/)
- [QEMU-KVM](https://www.qemu.org/) for running local VMs
- Optional: [Buildroot](https://buildroot.org/) when building the HAL image

### Building All Services

Run `make` in the repository root to compile the Agent, CLI and Manager. Artifacts are placed in the `build` directory. You can also build a single component:

```bash
make cli      # produces ./build/cocos-cli
make manager  # produces ./build/cocos-manager
make agent    # produces ./build/cocos-agent
```

### Building the HAL Image

The HAL is a minimal Linux distribution used inside the confidential VM. To build it, clone Buildroot and run:

```bash
git clone https://github.com/buildroot/buildroot.git
cd buildroot
git checkout 2024.11-rc2
make BR2_EXTERNAL=../cocos/hal/linux cocos_defconfig
make menuconfig    # optional, for additional configuration
make
```

The kernel image and root filesystem appear in `buildroot/output/images`. Copy `bzImage` and `rootfs.cpio.gz` to `cmd/manager/img` when testing locally.

### Testing the HAL Image

After building, you can boot a VM that runs the Agent using QEMU. Substitute the paths for your system:

```bash
sudo find / -name OVMF_CODE.fd
OVMF_CODE=/usr/share/OVMF/OVMF_CODE.fd
sudo find / -name OVMF_VARS.fd
OVMF_VARS=/usr/share/OVMF_VARS.fd

KERNEL=buildroot/output/images/bzImage
INITRD=buildroot/output/images/rootfs.cpio.gz
IGVM=svsm/bin/coconut-qemu.igvm
ENV_PATH=<path>/<to>/<env_directory>
CERTH_PATH=<path>/<to>/<cert_directory>

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
    -fsdev local,id=cert_fs,path=$CERTH_PATH,security_model=mapped \
    -device virtio-9p-pci,fsdev=cert_fs,mount_tag=certs_share
```

The default login password is `root`.

### Testing the Agent Independently

With a VM running, the Agent waits for connection to a cvms server via gRPC. You can start the Agent independently for testing:

```bash
cd cocos

go run cmd/agent/main.go \
  -algo-path <path-to-algorithm> \
  -public-key-path <path-to-public-key> \
  -attested-tls-bool <true|false> \
  -data-paths <comma-separated-data-paths> \
  -client-ca-file <path-to-client-ca-file> \
  -ca-url <ca-url-if-attestedTLS-true> \
  -cvm-id <cvm-id-if-attestedTLS-true>
```

A running cvms server is required for the Agent to function. The Agent will connect to the server and wait for a computation manifest. Instructions for running the cvms server are provided in the [CVMs server documentation](/docs/getting-started.md#run-the-server).

### Testing the Manager

A simple gRPC server is provided under `test/cvms/main.go` for development. Start it with the instructions in the [CVMs server documentation](/docs/getting-started.md#run-the-server).

Create `img` and `tmp` directories inside `cmd/manager` and copy the built kernel and rootfs there. Then run the Manager:

```bash
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

Manager will start and once the cvms server is up, it will connect to it and a vm can will be created.

### Manager Environment Configuration

When running under systemd or via `make run`, the Manager reads variables from
`/etc/cocos/cocos-manager.env`. This file defines gRPC options and numerous
`MANAGER_QEMU_*` settings controlling the VM image, memory size and CPU
parameters. Adjust these values before starting the service if custom resources
or ports are required.

Example entries from `cocos-manager.env`:

```bash
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

```bash
sudo make install_service
```

Start the Manager via systemd:

```bash
sudo systemctl start cocos-manager.service
```

You can also run `make run` to install the service and immediately start it.

## Code Generation

Whenever `.proto` files are modified, regenerate the Go sources with:

```bash
make protoc
```

Mocks for unit tests rely on method signatures. Refresh them after interface changes:

```bash
make mocks
```

## Running Tests

Execute all unit tests across packages with:

```bash
go test ./...
```

Run `make mocks` first if new interfaces were introduced.

## Troubleshooting

Zombie `qemu-system-x86_64` processes can linger after failed runs. Remove them with:

```bash
pkill -f qemu-system-x86_64
```

If any remain visible in `ps aux | grep qemu-system-x86_64`, terminate them manually with `kill -9 <PID>`.

Check the Manager service status with:

```bash
sudo systemctl status cocos-manager.service
```

View recent logs or follow output using `journalctl`:

```bash
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

For more information see [CONTRIBUTING.md](CONTRIBUTING.md).

## Further Documentation

Additional guides and design documents are available on the [official documentation site](https://docs.cocos.ultraviolet.rs) and in component `README` files.
