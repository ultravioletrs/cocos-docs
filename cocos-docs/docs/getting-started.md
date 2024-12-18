# Getting Started

## Prerequisites

Before proceeding install the following requirements.

- [Golang](https://go.dev/doc/install) (version 1.21.6)

## Getting COCOS

Get the cocos repository:

```bash
git clone https://github.com/ultravioletrs/cocos.git
```

### HAL

Get the hardware abstraction layer from the [releases](https://github.com/ultravioletrs/cocos/releases) on the cocos repository. Two files will be required:

- `rootfs.cpio.gz` - Initramfs
- `bzImage` - Kernel

Create two directories in `cocos/cmd/manager`, which are `img` and `tmp`.

```bash
mkdir -p cocos/cmd/manager/img cocos/cmd/manager/tmp
```

Copy the downloaded files to `cocos/cmd/manager/img`.

```bash
wget https://github.com/ultravioletrs/cocos/releases/download/v0.2.0/bzImage -P cocos/cmd/manager/img
wget https://github.com/ultravioletrs/cocos/releases/download/v0.2.0/rootfs.cpio.gz -P cocos/cmd/manager/img
```

If using the latest version of cocos see the [Developer guide](developer-guide.md#building-hal) for instructions on building HAL.

### Generating Keys

Generate a public and private key pair for user communication with agent on cli.

Build cli

```bash
cd cocos
```

```bash
make cli
```

Generate keys

```bash
./build/cocos-cli keys
```

The output will be similar to this:

```bash
2024/08/11 23:44:40 Successfully generated public/private key pair of type: *rsa.PrivateKey
```

The keys will be saved as `public.pem` and `private.pem` in the current directory.

### Starting Computations Server

The manager is a gRPC client and needs a gRPC server to connect to. We have an example server for testing purposes in `test/computations`. Run the server as follows:

```bash
go run ./test/computations/main.go <algo-path> <public-key-path> <attested-tls-bool> <data-paths>
```

`data-paths` can be empty, a single file or multiple files depending on the nature of the algorithm and type of data.

For example

```bash
go run ./test/computations/main.go ./test/manual/algo/addition.py ./public.pem false
```

Since this is an addition example, the data paths are empty.

The output will be similar to this:

```bash
{"time":"2024-08-12T00:05:13.321374245+03:00","level":"INFO","msg":"manager_test_server service gRPC server listening at :7001 without TLS"}
```

The test server uses the paths to the algorithm and datasets to obtain the file and include the file hashes in the computation manifest. The files are uploaded to the agent via cli. The public key provided can be generated using OpenSSL or cocos-cli.

### Running Manager

Next, we need to start manager. But first, we'll need to install some prerequisites.

#### Vsock

[Virtio-vsock](https://wiki.qemu.org/Features/VirtioVsock) is a host/guest communications device. It allows applications in the guest and host to communicate. In this case, it is used to communicate between the manager and the agent. To enable it run the following on the host:

```bash
sudo modprobe vhost_vsock
```

to confirm that it is enabled run:

```bash
ls -l /dev/vsock
```

The output will be similar to this:

```bash
crw-rw-rw- 1 root root 10, 122 Aug 11 23:47 /dev/vsock
```

and

```bash
ls -l /dev/vhost-vsock
```

The output will be similar to this:

```bash
crw-rw-rw- 1 root kvm 10, 241 Aug 11 23:47 /dev/vhost-vsock
```

#### OVMF

Find the ovmf code file:

```bash
sudo find / -name OVMF_CODE.fd
```

The output will be similar to this:

```bash
/usr/share/edk2/ia32/OVMF_CODE.fd
/usr/share/edk2/x64/OVMF_CODE.fd
/usr/share/OVMF/OVMF_CODE.fd
```

Find the ovmf vars file:

```bash
sudo find / -name OVMF_VARS.fd
```

the output will be similar to this

```bash
/usr/share/edk2/ia32/OVMF_VARS.fd
/usr/share/edk2/x64/OVMF_VARS.fd
/usr/share/OVMF/OVMF_VARS.fd
```

#### Run

When the manager connects to the computations server, the server then sends a computation manifest. In response, the manager will send logs and events from the computation both from the manager and the agent. To start run:

```bash
cd cmd/manager
```

```bash
sudo \
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_GRPC_URL=localhost:7001 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
go run main.go
```

The output of the manager will be similar to this:

```bash
{"time":"2024-08-12T00:05:21.119156392+03:00","level":"INFO","msg":"-enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=4 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/usr/share/edk2/x64/OVMF_VARS.fd -netdev user,id=vmnic,hostfwd=tcp::7020-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -vnc :0 -kernel img/bzImage -append \"earlyprintk=serial console=ttyS0\" -initrd img/rootfs.cpio.gz -nographic -monitor pty"}
{"time":"2024-08-12T00:05:38.725566058+03:00","level":"INFO","msg":"Method Run for computation took 17.591835113s to complete"}
{"time":"2024-08-12T00:05:38.727745349+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_event:{event_type:\"receivingAlgorithm\" timestamp:{seconds:1723410338 nanos:718187674} computation_id:\"1\" originator:\"agent\" status:\"in-progress\"}"}
{"time":"2024-08-12T00:05:38.727737113+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Transition: receivingManifest -> receivingManifest\\n\" computation_id:\"1\" level:\"DEBUG\" timestamp:{seconds:1723410338 nanos:717822747}}"}
{"time":"2024-08-12T00:05:38.727829542+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"agent service gRPC server listening at :7002 without TLS\" computation_id:\"1\" level:\"INFO\" timestamp:{seconds:1723410338 nanos:718373804}}"}
2024/08/12 00:05:41 traces export: Post "http://localhost:4318/v1/traces": dial tcp [::1]:4318: connect: connection refused
```

The output on the manager test server will be similar to this:

```bash
{"time":"2024-08-12T00:05:13.321374245+03:00","level":"INFO","msg":"manager_test_server service gRPC server listening at :7001 without TLS"}
{"time":"2024-08-12T00:05:21.132925448+03:00","level":"DEBUG","msg":"received who am on ip address [::1]:39498"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1723410321 nanos:133669966} computation_id:"1" originator:"manager" status:"starting"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1723410321 nanos:133914629} computation_id:"1" originator:"manager" status:"in-progress"}
received agent log
&{message:"char device redirected to /dev/pts/7 (label compat_monitor0)\n" computation_id:"1" level:"debug" timestamp:{seconds:1723410321 nanos:149109340}}
received agent log
&{message:"\x1b[2J\x1b[01" computation_id:"1" level:"debug" timestamp:{seconds:1723410321 nanos:566143873}}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1723410338 nanos:725491805} computation_id:"1" originator:"manager" status:"complete"}
received runRes
&{agent_port:"6006" computation_id:"1"}
received agent log
&{message:"Transition: receivingManifest -> receivingManifest\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1723410338 nanos:717822747}}
received agent event
&{event_type:"receivingAlgorithm" timestamp:{seconds:1723410338 nanos:718187674} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"agent service gRPC server listening at :7002 without TLS" computation_id:"1" level:"INFO" timestamp:{seconds:1723410338 nanos:718373804}}
```

### Uploading artefacts

From the logs we see agent has been bound to port `6006` which we can use with agent cli to send the algorithm, datasets and retrieve results. In this case, the `AGENT_GRPC_URL` will be `localhost:6006`.

We export the agent grpc url

```bash
export AGENT_GRPC_URL=localhost:6006
```

Upload the algorithm

```bash
./build/cocos-cli algo ./test/manual/algo/addition.py ./private.pem -a python
```

The output will be similar to this:

```bash
2024/08/12 00:06:34 Uploading algorithm binary: ./test/manual/algo/addition.py
Uploading algorithm...  100% [=========================================================================================================================>]
2024/08/12 00:06:34 Successfully uploaded algorithm
```

### Reading the results

Since this algorithm doesn't have a dataset we can go straight to reading the results

```bash
./build/cocos-cli result ./private.pem
```

The output will be similar to this:

```bash
2024/08/12 00:06:54 Retrieving computation result file
2024/08/12 00:06:54 Computation result retrieved and saved successfully!
```

To read the results

```bash
unzip result.zip -d results
```

```bash
cat results/result.txt
```

```bash
python3 test/manual/algo/addition.py test results/result.txt
```

Both should return the same result.

```bash
15
```

The output from the manager will be similar to this:

```bash
{"time":"2024-08-12T00:05:21.119156392+03:00","level":"INFO","msg":"-enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=4 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/usr/share/edk2/x64/OVMF_VARS.fd -netdev user,id=vmnic,hostfwd=tcp::7020-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -vnc :0 -kernel img/bzImage -append \"earlyprintk=serial console=ttyS0\" -initrd img/rootfs.cpio.gz -nographic -monitor pty"}
{"time":"2024-08-12T00:05:38.725566058+03:00","level":"INFO","msg":"Method Run for computation took 17.591835113s to complete"}
{"time":"2024-08-12T00:05:38.727745349+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_event:{event_type:\"receivingAlgorithm\" timestamp:{seconds:1723410338 nanos:718187674} computation_id:\"1\" originator:\"agent\" status:\"in-progress\"}"}
{"time":"2024-08-12T00:05:38.727737113+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Transition: receivingManifest -> receivingManifest\\n\" computation_id:\"1\" level:\"DEBUG\" timestamp:{seconds:1723410338 nanos:717822747}}"}
{"time":"2024-08-12T00:05:38.727829542+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"agent service gRPC server listening at :7002 without TLS\" computation_id:\"1\" level:\"INFO\" timestamp:{seconds:1723410338 nanos:718373804}}"}
2024/08/12 00:05:41 traces export: Post "http://localhost:4318/v1/traces": dial tcp [::1]:4318: connect: connection refused
{"time":"2024-08-12T00:06:34.864291735+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_event:{event_type:\"running\" timestamp:{seconds:1723410394 nanos:848027138} computation_id:\"1\" originator:\"agent\" status:\"in-progress\"}"}
{"time":"2024-08-12T00:06:34.864338115+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"computation run started\" computation_id:\"1\" level:\"DEBUG\" timestamp:{seconds:1723410394 nanos:847998168}}"}
{"time":"2024-08-12T00:06:37.39054944+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Transition: resultsReady -> resultsReady\\n\" computation_id:\"1\" level:\"DEBUG\" timestamp:{seconds:1723410397 nanos:374554947}}"}
{"time":"2024-08-12T00:06:37.390624125+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_event:{event_type:\"resultsReady\" timestamp:{seconds:1723410397 nanos:374563534} computation_id:\"1\" originator:\"agent\" status:\"in-progress\"}"}
{"time":"2024-08-12T00:06:54.575981836+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_event:{event_type:\"complete\" timestamp:{seconds:1723410414 nanos:561105934} computation_id:\"1\" originator:\"agent\" status:\"in-progress\"}"}
{"time":"2024-08-12T00:06:54.576028697+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Transition: complete -> complete\\n\" computation_id:\"1\" level:\"DEBUG\" timestamp:{seconds:1723410414 nanos:561077428}}"}
{"time":"2024-08-12T00:06:54.583319814+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Method Result took 1.403µs to complete without errors\" computation_id:\"1\" level:\"INFO\" timestamp:{seconds:1723410414 nanos:561057047}}"}
```

The output from the agent will be similar to this:

```bash
{"time":"2024-08-12T00:05:13.321374245+03:00","level":"INFO","msg":"manager_test_server service gRPC server listening at :7001 without TLS"}
{"time":"2024-08-12T00:05:21.132925448+03:00","level":"DEBUG","msg":"received who am on ip address [::1]:39498"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1723410321 nanos:133669966} computation_id:"1" originator:"manager" status:"starting"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1723410321 nanos:133914629} computation_id:"1" originator:"manager" status:"in-progress"}
received agent log
&{message:"char device redirected to /dev/pts/7 (label compat_monitor0)\n" computation_id:"1" level:"debug" timestamp:{seconds:1723410321 nanos:149109340}}
received agent log
&{message:"\x1b[2J\x1b[01" computation_id:"1" level:"debug" timestamp:{seconds:1723410321 nanos:566143873}}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1723410338 nanos:725491805} computation_id:"1" originator:"manager" status:"complete"}
received runRes
&{agent_port:"6006" computation_id:"1"}
received agent log
&{message:"Transition: receivingManifest -> receivingManifest\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1723410338 nanos:717822747}}
received agent event
&{event_type:"receivingAlgorithm" timestamp:{seconds:1723410338 nanos:718187674} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"agent service gRPC server listening at :7002 without TLS" computation_id:"1" level:"INFO" timestamp:{seconds:1723410338 nanos:718373804}}
received agent event
&{event_type:"running" timestamp:{seconds:1723410394 nanos:848027138} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"computation run started" computation_id:"1" level:"DEBUG" timestamp:{seconds:1723410394 nanos:847998168}}
received agent log
&{message:"Transition: resultsReady -> resultsReady\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1723410397 nanos:374554947}}
received agent event
&{event_type:"resultsReady" timestamp:{seconds:1723410397 nanos:374563534} computation_id:"1" originator:"agent" status:"in-progress"}
received agent event
&{event_type:"complete" timestamp:{seconds:1723410414 nanos:561105934} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"Transition: complete -> complete\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1723410414 nanos:561077428}}
received agent log
&{message:"Method Result took 1.403µs to complete without errors" computation_id:"1" level:"INFO" timestamp:{seconds:1723410414 nanos:561057047}}
```

These logs provide detailed information about the operations of the manager and agent and can be useful for troubleshooting any issues that may arise.

For more information on running different algorithms and datasets see the [algorithms](./algorithms.md) documentation.
