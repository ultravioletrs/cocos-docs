# Getting Started

## Prerequisites

Before proceeding, make sure you have the following installed:

- [Golang](https://go.dev/doc/install) (version 1.24 or later)

## Getting COCOS AI

Clone the Cocos repository:

```bash
git clone https://github.com/ultravioletrs/cocos.git
```

### HAL

Get the hardware abstraction layer from the [releases](https://github.com/ultravioletrs/cocos/releases) on the Cocos repository. You will need the following two files:

- `rootfs.cpio.gz` - Initramfs
- `bzImage` - Kernel image

Create the necessary directories inside the cocos/cmd/manager path: `img` and `tmp`.

```bash
mkdir -p cocos/cmd/manager/img cocos/cmd/manager/tmp
```

Copy the downloaded files to `cocos/cmd/manager/img`.

```bash
wget https://github.com/ultravioletrs/cocos/releases/download/v0.6.0/bzImage -P cocos/cmd/manager/img
wget https://github.com/ultravioletrs/cocos/releases/download/v0.6.0/rootfs.cpio.gz -P cocos/cmd/manager/img
```

If are using the latest version of Cocos, refer to the [Developer guide](developer-guide.md#building-hal) for instructions on building the Hardware Abstraction Layer (HAL).

### Generating Keys

To enable secure communication between the user and the agent via the CLI, you need to generate a public/private RSA key pair.

Navigate to the project root and build the CLI tool:

```bash
cd cocos

make cli
```

Use the CLI to generate the keys:

```bash
./build/cocos-cli keys
```

You should see output similar to:

```bash
Successfully generated public/private key pair of type: rsa%
```

The generated keys will be saved in the current directory as:

- public.pem — the public key

- private.pem — the private key

### Starting Cvms Server

The agent includes a CVMS gRPC client, which requires a corresponding gRPC server to communicate with. For testing purposes, an example server is provided in the `test/cvms` directory. You can run the server using the following commands:

#### Finding Your IP Address

When running the CVMS server, make sure to use an IP address that is reachable from the virtual machine — rather than using localhost. To determine your host machine’s IP address, you can run:

```bash
ip a
```

Look for your network interface (such as wlan0 for WiFi or eth0 for Ethernet) and note the IP address. For example:

```bash
2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 12:34:56:78:9a:bc brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic noprefixroute wlan0
```

In this example, the IP address is 192.168.1.100. This address should be used both when launching the CVMS server and when configuring the CVM using the manager tool.

#### Run the Server

To run the test CVMS server, use the following command:

```bash
HOST=<externally_accessible_ip> go run ./test/cvms/main.go \
    -algo-path <algo-path> \
    -public-key-path <public-key-path> \
    -data-paths <data-paths> \
    -attested-tls-bool <attested-tls-bool> \
    -ca-url <ca_url> \
    -cmv-id <cvm_uuid> \
    -client-ca-file <path_to_client_ca_file_within_the_CVM>
```

#### Parameter Descriptions

`-data-paths`: May be left empty, or provided as a single file or a list of files, depending on the algorithm and data type.

`-attested-tls-bool`: Set to true if Attested TLS (aTLS) is required; otherwise, use false.
`-ca-url` and `-cvm-id`: Required if the agent must obtain a certificate from a Certificate Authority (CA), otherwise the agent will use a self-signed certificate.
`-client-ca-file` Required for mutual TLS (mTLS) or mutual attested TLS (maTLS).

For example:

```bash
HOST="192.168.1.41" go run ./test/cvms/main.go \
    -algo-path ./test/manual/algo/addition.py \
    -public-key-path ./public.pem \
    -attested-tls-bool false
```

In this example, no data files are provided, as the addition.py algorithm does not require input datasets.

Expected Output:

```bash
{"time":"2025-06-25T14:52:58.693344502+02:00","level":"INFO","msg":"cvms_test_server service gRPC server listening at 192.168.1.41:7001 without TLS"}
```

The test server uses the specified algorithm and data file paths to compute file hashes, which are then included in the computation manifest. These files are later uploaded to the agent via the CLI. The provided public key can be generated using either OpenSSL or the cocos-cli tool.

### Running Manager

Next, you’ll start the manager component. Before doing so, ensure that all necessary prerequisites are installed.

#### OVMF

Locating OVMF_CODE.fd files:

```bash
sudo find / -name OVMF_CODE.fd
```

The output will be similar to this:

```bash
/usr/share/edk2/ia32/OVMF_CODE.fd
/usr/share/edk2/x64/OVMF_CODE.fd
/usr/share/OVMF/OVMF_CODE.fd
```

Locating OVMF.fd files:

```bash
sudo find / -name OVMF.fd
```

The output will be similar to this:

```bash
/usr/share/edk2/ia32/OVMF.fd
/usr/share/edk2/x64/OVMF.fd
/usr/share/OVMF/OVMF.fd
```

Find the OVMF_VARS.fd file:

```bash
sudo find / -name OVMF_VARS.fd
```

the output will be similar to this

```bash
/usr/share/edk2/ia32/OVMF_VARS.fd
/usr/share/edk2/x64/OVMF_VARS.fd
/usr/share/OVMF/OVMF_VARS.fd
```

#### Start Manager

To start run:

```bash
cd cmd/manager
```

```bash
sudo \
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_GRPC_HOST=localhost \
MANAGER_GRPC_PORT=7002 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd  \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
go run main.go
```

The output of the manager will be similar to this:

```bash
{"time":"2025-06-25T17:21:44.3400595+02:00","level":"INFO","msg":"manager service gRPC server listening at localhost:7002 without TLS"}
{"time":"2025-06-25T17:22:02.397631955+02:00","level":"INFO","msg":"Method CreateVM for id e71cdcf5-21c0-4e1d-9471-ac6b4389d5f3 on port 6100 took 751.884µs to complete"}
```

##### Create a cvm

To create a cvm we'll need the host address used to start the cvms server. An example is shown below:

```bash
export MANAGER_GRPC_URL=localhost:7002
./build/cocos-cli create-vm --log-level debug --server-url "192.168.1.41:7001"
```

When the cvm boots, it will connect to the cvms server and receive a computation manifest. Once started agent will send back events and logs.

The output on the cvms test server will be similar to this:

```bash
🔗 Connected to manager using  without TLS
🔗 Creating a new virtual machine
✅ Virtual machine created successfully with id e71cdcf5-21c0-4e1d-9471-ac6b4389d5f3 and port 6100
```

### Checking for Running QEMU Processes

To check if a QEMU virtual machine is currently running, use:

```bash
ps aux | grep qemu
```

You might see output similar to the following:

```bash
root      290254  4.6  3.6 2927088 1172652 pts/5 Sl+  17:22   0:11 /usr/bin/qemu-system-x86_64 -enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=4 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.4m.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/tmp/OVMF_VARS-f889cada-4fc2-44bb-b6e2-99def75c5df8.fd -netdev user,id=vmnic-f889cada-4fc2-44bb-b6e2-99def75c5df8,hostfwd=tcp::6100-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic-f889cada-4fc2-44bb-b6e2-99def75c5df8,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -kernel img/bzImage -append "quiet console=null" -initrd img/rootfs.cpio.gz -nographic -monitor pty -fsdev local,id=cert_fs,path=/tmp/e71cdcf5-21c0-4e1d-9471-ac6b4389d5f33730550812,security_model=mapped -device virtio-9p-pci,fsdev=cert_fs,mount_tag=certs_share -fsdev local,id=env_fs,path=/tmp/e71cdcf5-21c0-4e1d-9471-ac6b4389d5f32869802710,security_model=mapped -device virtio-9p-pci,fsdev=env_fs,mount_tag=env_share
filip     294852  0.0  0.0   6460  3892 pts/3    S+   17:26   0:00 grep qemu
```

### Uploading assets

The logs indicate that the agent is bound to port 6100. This port is used by the Agent CLI to upload algorithms and datasets, and to retrieve results. In this case, the AGENT_GRPC_URL is set to localhost:6100.

We export the agent grpc url

```bash
export AGENT_GRPC_URL=localhost:6100
```

Upload the algorithm

```bash
./build/cocos-cli algo ./test/manual/algo/addition.py ./private.pem -a python
```

A successful upload will produce output similar to the following:

```bash
🔗 Connected to agent  without TLS
Uploading algorithm file: ./test/manual/algo/addition.py
🚀 Uploading algorithm [███████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                             
Successfully uploaded algorithm! ✔ 
```

### Reading the results

Since this algorithm does not require a dataset, the results can be retrieved immediately after the upload. Use the following command to read the output:

```bash
./build/cocos-cli result ./private.pem
```

The output will be similar to this:

```bash
🔗 Connected to agent  without TLS
⏳ Retrieving computation result file
📥 Downloading result [████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                             
Computation result retrieved and saved successfully as results.zip! ✔ 
```

To read the results

```bash
unzip results.zip -d results
```

```bash
cat results/results.txt
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
{"time":"2025-06-26T15:07:27.920429021+02:00","level":"INFO","msg":"Manager started without confidential computing support"}
{"time":"2025-06-26T15:07:27.920515793+02:00","level":"INFO","msg":"-enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=4 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.4m.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/usr/share/edk2/x64/OVMF_VARS.4m.fd -netdev user,id=vmnic,hostfwd=tcp::7020-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -kernel img/bzImage -append \"quiet console=null\" -initrd img/rootfs.cpio.gz -nographic -monitor pty"}
```

The output from the agent will be similar to this:

```bash
{"time":"2025-06-26T15:06:47.723928225+02:00","level":"INFO","msg":"cvms_test_server service gRPC server listening at 192.168.0.103:7001 without TLS"}
{"time":"2025-06-26T15:10:02.366688889+02:00","level":"DEBUG","msg":"received who am on ip address 192.168.0.103:46962"}
&{message:"TEE device not found"  level:"INFO"  timestamp:{seconds:1750943402  nanos:390450805}}
&{}
&{}
&{message:"Method InitComputation for computation id 1 took 2.668µs to complete without errors"  computation_id:"1"  level:"INFO"  timestamp:{seconds:1750943402  nanos:403861196}}
&{computation_id:"1"}
&{event_type:"ReceivingAlgorithm"  timestamp:{seconds:1750943402  nanos:403967628}  computation_id:"1"  originator:"agent"  status:"InProgress"}
&{message:"agent service gRPC server listening at 10.0.2.15:7002 without TLS"  computation_id:"1"  level:"INFO"  timestamp:{seconds:1750943402  nanos:404133451}}
&{message:"Method Algo took 67.014µs to complete without errors"  computation_id:"1"  level:"INFO"  timestamp:{seconds:1750943531  nanos:123858685}}
&{event_type:"Running"  timestamp:{seconds:1750943531  nanos:123887962}  computation_id:"1"  originator:"agent"  status:"Starting"}
&{message:"computation run started"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943531  nanos:123901169}}
&{event_type:"Running"  timestamp:{seconds:1750943531  nanos:123943438}  computation_id:"1"  originator:"agent"  status:"InProgress"}
&{message:"Requirement already satisfied: pip in ./venv/lib/python3.12/site-packages (24.2)\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943532  nanos:957716465}}
&{message:"Collecting pip\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:210139297}}
&{message:"  Downloading pip-25.1.1-py3-none-any.whl.metadata (3.6 kB)\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:400483294}}
&{message:"Downloading pip-25.1.1-py3-none-any.whl (1.8 MB)\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:421811653}}
&{message:"   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.8/1.8 MB 11.7 MB/s eta 0:00:00"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:611815499}}
&{message:"\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:611996756}}
&{message:"Installing collected packages: pip\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:623045689}}
&{message:"  Attempting uninstall: pip\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:623157529}}
&{message:"    Found existing installation: pip 24.2\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:624924053}}
&{message:"    Uninstalling pip-24.2:\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:648927254}}
&{message:"      Successfully uninstalled pip-24.2\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943533  nanos:652644672}}
&{message:"Successfully installed pip-25.1.1\n"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1750943534  nanos:270544492}}
&{event_type:"Running"  timestamp:{seconds:1750943534  nanos:431095551}  computation_id:"1"  originator:"agent"  status:"Completed"}
&{event_type:"ConsumingResults"  timestamp:{seconds:1750943534  nanos:431130290}  computation_id:"1"  originator:"agent"  status:"Ready"}
&{message:"Method Result took 5.203µs to complete without errors"  computation_id:"1"  level:"INFO"  timestamp:{seconds:1750943555  nanos:27719184}}
&{event_type:"Complete"  timestamp:{seconds:1750943555  nanos:28133684}  computation_id:"1"  originator:"agent"  status:"Completed"}
```

These logs provide detailed information about the operations of the manager and agent and can be useful for troubleshooting any issues that may arise.

For more information on running different algorithms and datasets see the [algorithms](./algorithms.md) documentation.

### Deleting the cvm

After completion, the CVM can be safely destroyed using the following command:

```bash
./build/cocos-cli remove-vm <cvm_id>
```

```bash
🔗 Connected to agent  without TLS
🔗 Connected to manager using  without TLS
🔗 Removing virtual machine
✅ Virtual machine removed successfully
```
