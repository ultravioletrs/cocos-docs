# Manager

Manager runs on the TEE-capable host (AMD SEV-SNP or Intel TDX) and has 2 main roles:

1. To deploy the well-prepared TEE upon the `run` command and upload the necessary configuration into it (command line arguments, TLS certificates, etc...)
2. To monitor deployed TEE and provide remote logs

Manager exposes an API for control, based on gRPC, and is controlled by Computation Management service. Manager acts as the client of Computation Management service and connects to it upon the start via TLS-encoded gRPC connection.

Computation Management service is used to configure computation metadata. Once a computation is created by a user and the invited users have uploaded their public certificates (used later for identification and data exchange in the enclave), a run request is sent. The Manager is responsible for creating the TEE in which computation will be ran and managing the computation lifecycle.

The picture below shows where the Manager runs in the Cocos system, helping us better understand its role.

![Manager](/img/manager.png)

## vTPM-Based Attestation & IGVM Validation

- vTPM Attestation: The Agent retrieves cryptographic measurements from the vTPM inside the CVM. These measurements are used to verify the enclave's boot and runtime state, ensuring that it operates on trusted hardware and remains unmodified.
- IGVM Validation: The Manager verifies the Initial Guest Virtual Machine (IGVM) file by computing its expected launch measurement and comparing it with attestation reports. This process ensures that the CVM's initial state aligns with security expectations, preventing unauthorized modifications.

By integrating SEV-SNP attestation, vTPM integrity checks, and IGVM validation, the Manager enforces a secure and verifiable execution environment.

## Setup and Test Manager Agent

```sh
git clone https://github.com/ultravioletrs/cocos
cd cocos
```

> **N.B.** All relative paths in this document are relative to `cocos` repository directory.

### Prerequisites

Before proceeding, make sure you have the following installed:

- [Golang](https://go.dev/doc/install) (version 1.24 or later)
- QEMU-KVM virtualization platform

### QEMU-KVM

[QEMU-KVM](https://www.qemu.org/) is a virtualization platform that allows you to run multiple operating systems on the same physical machine. It is a combination of two technologies: QEMU and KVM.

- QEMU is an emulator that can run a variety of operating systems, including Linux, Windows, and macOS.
- [KVM](https://wiki.qemu.org/Features/KVM) is a Linux kernel module that allows QEMU to run virtual machines.

To install QEMU-KVM on a Debian based machine, run

```sh
sudo apt update
sudo apt install qemu-kvm
```

### Prepare Cocos HAL

Get the hardware abstraction layer from the [releases](https://github.com/ultravioletrs/cocos/releases) on the cocos repository. Two files will be required:

- `rootfs.cpio.gz` - Initramfs
- `bzImage` - Kernel

Create the necessary directories inside the cocos/cmd/manager path: `img` and `tmp`.

```bash
mkdir -p cocos/cmd/manager/img cocos/cmd/manager/tmp
```

Copy the downloaded files to `cocos/cmd/manager/img`.

```bash
wget https://github.com/ultravioletrs/cocos/releases/download/v0.6.0/bzImage -P cocos/cmd/manager/img
wget https://github.com/ultravioletrs/cocos/releases/download/v0.6.0/rootfs.cpio.gz -P cocos/cmd/manager/img
```

If using the latest version of cocos see the Developer guide for instructions on building HAL.

### OVMF

We need [Open Virtual Machine Firmware](https://wiki.ubuntu.com/UEFI/OVMF). OVMF is a port of Intel's tianocore firmware - an open source implementation of the Unified Extensible Firmware Interface (UEFI) - used by a qemu virtual machine. We need OVMF in order to run virtual machine with _focal-server-cloudimg-amd64_. When we install QEMU, we get two files that we need to start a VM: `OVMF_VARS.fd` and `OVMF_CODE.fd`. We will make a local copy of `OVMF_VARS.fd` since a VM will modify this file. On the other hand, `OVMF_CODE.fd` is only used as a reference, so we only record its path in an environment variable.

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

### Starting CVMS Server

The agent includes a CVMS gRPC client, which requires a corresponding gRPC server to communicate with. For testing purposes, an example server is provided in the `test/cvms` directory.

#### Finding Your IP Address

When running the CVMS server, make sure to use an IP address that is reachable from the virtual machine — rather than using localhost. To determine your host machine's IP address, you can run:

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

- `-data-paths`: May be left empty, or provided as a single file or a list of files, depending on the algorithm and data type.
- `-attested-tls-bool`: Set to true if Attested TLS (aTLS) is required; otherwise, use false.
- `-ca-url` and `-cvm-id`: Required if the agent must obtain a certificate from a Certificate Authority (CA), otherwise the agent will use a self-signed certificate.
- `-client-ca-file`: Required for mutual TLS (mTLS) or mutual attested TLS (maTLS).

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

## Running Manager

### Start Manager

To start the manager, navigate to the manager directory and run:

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
```

To enable [AMD SEV](https://www.amd.com/en/developer/sev.html) support, set these additional environment variables:

```bash
MANAGER_QEMU_USE_SUDO=true
MANAGER_QEMU_ENABLE_SEV=true
MANAGER_QEMU_SEV_CBITPOS=51
```

You can also enable SEV_SNP through the environment variable:

```bash
MANAGER_QEMU_ENABLE_SEV_SNP=true
```

### Creating a CVM

To create a CVM, use the cocos-cli tool. First, set the manager URL:

```bash
export MANAGER_GRPC_URL=localhost:7002
```

Then create the CVM:

```bash
./build/cocos-cli create-vm --log-level debug --server-url "localhost:7002"
```

When the CVM boots, it will connect to the CVMS server and receive a computation manifest. Once started, the agent will send back events and logs.

The output will be similar to this:

```bash
🔗 Connected to manager using  without TLS
🔗 Creating a new virtual machine
✅ Virtual machine created successfully with id e71cdcf5-21c0-4e1d-9471-ac6b4389d5f3 and port 6100
```

The manager will also log the creation:

```bash
{"time":"2025-06-25T17:22:02.397631955+02:00","level":"INFO","msg":"Method CreateVM for id e71cdcf5-21c0-4e1d-9471-ac6b4389d5f3 on port 6100 took 751.884µs to complete"}
```

### Verifying VM Launch

To verify that the manager successfully launched the VM, run the following command:

```bash
ps aux | grep qemu
```

You should get something similar to this:

```bash
root      290254  4.6  3.6 2927088 1172652 pts/5 Sl+  17:22   0:11 /usr/bin/qemu-system-x86_64 -enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=4 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.4m.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/tmp/OVMF_VARS-f889cada-4fc2-44bb-b6e2-99def75c5df8.fd -netdev user,id=vmnic-f889cada-4fc2-44bb-b6e2-99def75c5df8,hostfwd=tcp::6100-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic-f889cada-4fc2-44bb-b6e2-99def75c5df8,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -kernel img/bzImage -append "quiet console=null" -initrd img/rootfs.cpio.gz -nographic -monitor pty -fsdev local,id=cert_fs,path=/tmp/e71cdcf5-21c0-4e1d-9471-ac6b4389d5f33730550812,security_model=mapped -device virtio-9p-pci,fsdev=cert_fs,mount_tag=certs_share -fsdev local,id=env_fs,path=/tmp/e71cdcf5-21c0-4e1d-9471-ac6b4389d5f32869802710,security_model=mapped -device virtio-9p-pci,fsdev=env_fs,mount_tag=env_share
```

### Uploading Assets

The logs indicate that the agent is bound to a specific port (e.g., port 6100). This port is used by the Agent CLI to upload algorithms and datasets, and to retrieve results.

Set the agent URL:

```bash
export AGENT_GRPC_URL=localhost:6100
```

Upload the algorithm:

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

### Reading the Results

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

To read the results:

```bash
unzip results.zip -d results
cat results/results.txt
```

### Deleting the CVM

After completion, the CVM can be safely destroyed using the following command:

```bash
./build/cocos-cli remove-vm <cvm_id>
```

Expected output:

```bash
🔗 Connected to agent  without TLS
🔗 Connected to manager using  without TLS
🔗 Removing virtual machine
✅ Virtual machine removed successfully
```

## Alternative Installation Method

You can also install and run the manager using the make commands:

```bash
# download the latest version of the service
go get github.com/ultravioletrs/cocos

cd $GOPATH/src/github.com/ultravioletrs/cocos
```

Variables should be set at this point in [cocos-manager.env](https://github.com/ultravioletrs/cocos/blob/main/cocos-manager.env).

```bash
# builds binaries, copies them to bin and installs the env variables required for manager
make install

# run the service
make run
```

You can view logs from manager using the following commands:

```bash
# check manager status
sudo systemctl status cocos-manager

# follow logs from manager
journalctl -u cocos-manager -n 20 -f
```
