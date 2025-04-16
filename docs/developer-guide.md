# Developer Guide

## Getting CoCos

CoCos is found on the [CoCos repository](https://github.com/ultravioletrs/cocos). You should fork the repository in order to make changes to the repository. After forking the repository, you can clone it as follows:

```shell
git clone <forked repository> $SOMEPATH/cocos
cd $SOMEPATH/cocos
```

## Building

### Prerequisites

- [Protocol Buffers](https://grpc.io/docs/languages/go/quickstart/)
- [Golang](https://go.dev/doc/install)

### Build All Services

Use the GNU Make tool to build all CoCos services `make`. Build artifacts will be put in the build directory.

### Building HAL

To build the custom linux image that will host agent, run:

```shell
git clone https://github.com/buildroot/buildroot.git
cd buildroot
git checkout 2024.11-rc2 
make BR2_EXTERNAL=../cocos/hal/linux cocos_defconfig
make menuconfig #optional for additional configuration
make
```

#### Testing HAL image

##### Launch the VM

To launch the virtual machine containing agent for testing purposes, run:

```shell
sudo find / -name OVMF_CODE.fd
# => /usr/share/OVMF/OVMF_CODE.fd
OVMF_CODE=/usr/share/OVMF/OVMF_CODE.fd

sudo find / -name OVMF_VARS.fd
# => /usr/share/OVMF/OVMF_VARS.fd
OVMF_VARS=/usr/share/OVMF/OVMF_VARS.fd

KERNEL="buildroot/output/images/bzImage"
INITRD="buildroot/output/images/rootfs.cpio.gz"

qemu-system-x86_64 \ 
    -enable-kvm \
    -cpu EPYC-v4 \
    -machine q35 \
    -smp 4 \
    -m 25G,slots=5,maxmem=30G \
    -no-reboot \
    -drive if=pflash,format=raw,unit=0,file=$OVMF_CODE,readonly=on \
    -netdev user,id=vmnic,hostfwd=tcp::7020-:7002 \
    -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,romfile= \
    -kernel $KERNEL \
    -append "earlyprintk=serial console=ttyS0" \
    -initrd $INITRD \
    -nographic \
    -monitor pty \
    -monitor unix:monitor,server,nowait \
    -fsdev local,id=cert_fs,path=/home/sammyk/Documents/certs,security_model=mapped \
    -device virtio-9p-pci,fsdev=cert_fs,mount_tag=certs_share \
    -fsdev local,id=env_fs,path=/home/sammyk/Documents/env,security_model=mapped \
    -device virtio-9p-pci,fsdev=env_fs,mount_tag=env_share
```

The default password is `root`.

### Testing Agent Independently

Agent once started will wait to receive its configuration via v-sock. For testing purposes you can use the script in `cocos/test/manual/agent-config`. This script sends agent config and also receives logs and events from agent. Once the VM is launched you can send config including computation manifest to agent as follows:

```shell
cd cocos
go run ./test/manual/agent-config/main.go <data-path> <algo-path> <public-key-path> <attested-tls-bool>
```

### Testing Manager

Manager is a gRPC client and needs gRPC sever to connect to. We have an example server for testing purposes in `test/computations`. Run the server as follows:

```shell
go run ./test/computations/main.go /path/to/algo/file /path/to/public/key/file <attested_tls_bool> /path/to/data/file1.zip path/to/data/file2.zip path/to/data/file3.zip
```

#### Run Manager

Create two directories in `cocos/cmd/manager`, the directories are `img` and `tmp`.
Copy `rootfs.cpio.gz` and `bzImage` from the buildroot output directory files to `cocos/cmd/manager/img`.

Next run manager client.

```shell
cd cmd/manager
MANAGER_GRPC_URL=localhost:7001 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_USE_SUDO=false \
MANAGER_QEMU_ENABLE_SEV=false \
MANAGER_QEMU_SEV_CBITPOS=51 \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/ovmf/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/ovmf/OVMF_VARS.fd \
./build/cocos-manager
```

This will result in manager sending a whoIam request to manager-server. Manager server will then launch a VM with agent running and having received the computation manifest.

## Protobuf

If you've made any changes to .proto files, you should call protoc command prior to compiling individual microservices.

To do this by hand, execute:
`make protoc`

## Mocks

To run tests, some of the services are mocked and these need to be updated if the function signatures are changed.

To do this, execute:
`make mocks`

## Troubleshooting

If you run `ps aux | grep qemu-system-x86_64` and it returns give you something like this:

```shell
sammy      13913  0.0  0.0      0     0 pts/2    Z+   20:17   0:00 [qemu-system-x86] <defunct>
```

means that the a QEMU virtual machine that is currently defunct, meaning that it is no longer running. More precisely, the defunct process in the output is also known as a ["zombie" process](https://en.wikipedia.org/wiki/Zombie_process).

### Kill `qemu-system-x86_64` Processes

To kill any leftover `qemu-system-x86_64` processes, use
`pkill -f qemu-system-x86_64`
The pkill command is used to kill processes by name or by pattern. The `-f` flag to specify that we want to kill processes that match the pattern `qemu-system-x86_64`. It sends the SIGKILL signal to all processes that are running `qemu-system-x86_64`.

If this does not work, i.e. if `ps aux | grep qemu-system-x86_64` still outputs `qemu-system-x86_64` related process(es), you can kill the unwanted process with `kill -9 <PID>`, which also sends a SIGKILL signal to the process.
