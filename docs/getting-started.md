# Getting Started

## Prerequisites
Before proceeding install the following requirements.
- [Golang](https://go.dev/doc/install) (version 1.21.6)

## Getting CoCos
Get the cocos repository:
`git clone https://github.com/ultravioletrs/cocos.git`

### HAL
Get the hardware abstraction layer from the [releases](https://github.com/ultravioletrs/cocos/releases) on the cocos repository. Two files will be required:
- `rootfs.cpio.gz` - Initramfs
- `bzImage` - Kernel

Create two directories in `cocos/cmd/manager`, the directories are `img` and `tmp`.
Copy the downloaded files to `cocos/cmd/manager/img`.

## Starting Manager Server
Manager is a gRPC client and needs gRPC sever to connect to. We have an example server for testing purposes in `test/manager-server`. Run the server as follows:

`go run ./test/manager-server/main.go`

the output should be simillar to this:
`{"time":"2024-03-19T12:27:46.542638146+03:00","level":"INFO","msg":"manager_test_server service gRPC server listening at :7001 without TLS"}`

## Running Manager
Next we need to start manager. But first we'll need to install some prerequisites.

### Vsock
[Virtio-vsock](https://wiki.qemu.org/Features/VirtioVsock) is a host/guest communications device. It allows applications in the guest and host to communicate. In this case, it is used to communicate between manager and agent. To enable it run the following on the host:
`sudo modprobe vhost_vsock`

to confirm that it is enabled run:
`ls -l /dev/vsock` and `ls -l /dev/vhost-vsock`
the output should be simillar to this respectively:
`crw-rw-rw- 1 root root 10, 121 Mar 18 14:01 /dev/vsock` and `crw-rw-rw- 1 root kvm 10, 241 Mar 18 14:01 /dev/vhost-vsock`

### OVMF
Find the ovmf code file:
```shell
sudo find / -name OVMF_CODE.fd
```
The output will be simillar to this:
```shell
/usr/share/edk2/x64/OVMF_CODE.fd
/usr/share/edk2/ia32/OVMF_CODE.fd
```

Find the ovmf vars file:
```shell
sudo find / -name OVMF_VARS.fd
```
the output will be simillar to this 
```shell
/usr/share/edk2/x64/OVMF_VARS.fd
/usr/share/edk2/ia32/OVMF_VARS.fd
```

### Run
When manager connects to the server, it sends a whoAmI request after which the server sends a computation manifest. In response manager will sends logs and events from the computation both from manager and agent. To start run:

```shell
cd cmd/manager
MANAGER_GRPC_URL=localhost:7001 MANAGER_LOG_LEVEL=debug MANAGER_QEMU_USE_SUDO=false  MANAGER_QEMU_ENABLE_SEV=false MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd go run main.go
```

The output on manager will be simillar to this:
```shell
{"time":"2024-03-19T12:38:53.647541406+03:00","level":"INFO","msg":"/usr/bin/qemu-system-x86_64 -enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=64 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/usr/share/edk2/x64/OVMF_VARS.fd -netdev user,id=vmnic,hostfwd=tcp::7020-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -vnc :0 -kernel img/bzImage -append \"earlyprintk=serial console=ttyS0\" -initrd img/rootfs.cpio.gz -nographic -monitor pty"}
{"time":"2024-03-19T12:39:07.819774273+03:00","level":"INFO","msg":"Method Run for computation took 14.169748744s to complete"}
{"time":"2024-03-19T12:39:07.821687259+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Method Run for computation 1 took 51.066µs to complete without errors.\"  computation_id:\"1\"  level:\"INFO\"  timestamp:{seconds:1710841147  nanos:818774262}}"}
{"time":"2024-03-19T12:39:07.821994067+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Transition: receivingAlgorithms -> receivingAlgorithms\\n\"  computation_id:\"1\"  level:\"DEBUG\"  timestamp:{seconds:1710841147  nanos:819067478}}"}
{"time":"2024-03-19T12:39:07.822053853+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_event:{event_type:\"receivingAlgorithms\"  timestamp:{seconds:1710841147  nanos:819118886}  computation_id:\"1\"  originator:\"agent\"  status:\"in-progress\"}"}
{"time":"2024-03-19T12:39:07.822605252+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"agent service gRPC server listening at :7002 without TLS\"  computation_id:\"1\"  level:\"INFO\"  timestamp:{seconds:1710841147  nanos:819759020}}"}
```

The output on manager test server will be simillar to this:
```shell
{"time":"2024-03-19T12:27:46.542638146+03:00","level":"INFO","msg":"manager_test_server service gRPC server listening at :7001 without TLS"}
{"time":"2024-03-19T12:38:53.64961785+03:00","level":"DEBUG","msg":"received who am on ip address [::1]:48592"}
received whoamI
&{}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1710841133 nanos:649982672} computation_id:"1" originator:"manager" status:"starting"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1710841133 nanos:650082447} computation_id:"1" originator:"manager" status:"in-progress"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1710841147 nanos:819724344} computation_id:"1" originator:"manager" status:"complete"}
received runRes
&{agent_port:"46693" computation_id:"1"}
received agent log
&{message:"Method Run for computation 1 took 51.066µs to complete without errors." computation_id:"1" level:"INFO" timestamp:{seconds:1710841147 nanos:818774262}}
received agent log
&{message:"Transition: receivingAlgorithms -> receivingAlgorithms\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1710841147 nanos:819067478}}
received agent event
&{event_type:"receivingAlgorithms" timestamp:{seconds:1710841147 nanos:819118886} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"agent service gRPC server listening at :7002 without TLS" computation_id:"1" level:"INFO" timestamp:{seconds:1710841147 nanos:819759020}}
```

From the logs we see agent has been bound to port `48592` which we can use with agent cli to send the algorithm, datasets and retrieve results. In this case the `AGENT_GRPC_URL` will be `localhost:48592`. To test agent proceed to [CLI](/cli)
