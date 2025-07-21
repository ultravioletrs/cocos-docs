# Manager

Manager runs on the TEE-capable host (AMD SEV-SNP or Intel TDX) and has two primary roles:

1. **TEE Deployment and Configuration**: Upon receiving a create cvm request, the Manager is responsible for deploying the prepared Trusted Execution Environment (TEE). This involves uploading necessary configurations such as command-line arguments, TLS certificates, and other runtime parameters into the TEE.  
2. **TEE Monitoring and Logging**: The Manager continuously monitors the deployed TEE, providing remote logs and status updates. This capability is crucial for observing the cvm's lifecycle and health.

The Manager exposes a gRPC-based API for control and interacts with the Computation Management service. It acts as a client to the Computation Management service, establishing a TLS-encoded gRPC connection upon startup.

The Computation Management service configures computation metadata. Once a user creates a computation and invited users upload their public certificates (used for identification and data exchange within the enclave), a run request is sent to agent. The Manager is responsible for creating the TEE in which computation will be ran and managing the computation lifecycle.

The diagram below illustrates the Manager's position within the Cocos system, clarifying its role:

![Manager](/img/manager.png)

## vTPM-Based Attestation & IGVM Validation

* **vTPM Attestation**: The Agent retrieves cryptographic measurements from the vTPM inside the CVM. These measurements are used to verify the enclave's boot and runtime state, ensuring that it operates on trusted hardware and remains unmodified. This process provides assurance of the CVM's integrity from the moment it starts.  
* **IGVM Validation**: The Manager verifies the Initial Guest Virtual Machine (IGVM) file by computing its expected launch measurement and comparing it with attestation reports. This process ensures that the CVM's initial state aligns with security expectations, preventing unauthorized modifications and ensuring a secure boot.

By integrating SEV-SNP/TDX attestation, vTPM integrity checks, and IGVM validation, the Manager enforces a secure and verifiable execution environment, crucial for confidential computing.

## Setup and Test Manager - Agent

```shell
git clone https://github.com/ultravioletrs/cocos  
cd cocos
```

**N.B.** All relative paths in this document are relative to the cocos repository directory.

### Prerequisites

Before proceeding, ensure you have the following installed:

* [Golang](https://go.dev/doc/install) (version 1.24 or later)  
* QEMU-KVM virtualization platform

### QEMU-KVM

[QEMU-KVM](https://www.qemu.org/) is a powerful open-source virtualization platform for Linux. It combines QEMU (a generic open-source machine emulator and virtualizer) with KVM (Kernel-based Virtual Machine), a Linux kernel module that allows a host machine to use hardware virtualization extensions (Intel VT or AMD-V) to run virtual machines at near-native speeds.

To install QEMU-KVM on a Debian-based machine, run:

```shell
sudo apt update  
sudo apt install qemu-kvm
```

### Prepare Cocos HAL

Obtain the hardware abstraction layer (HAL) files from the [releases](https://github.com/ultravioletrs/cocos/releases) on the Cocos repository. Two essential files are required:

* `rootfs.cpio.gz` \- The initial RAM filesystem (initramfs) for the CVM.  
* `bzImage` \- The Linux kernel image.

Create the necessary directories inside the cocos/cmd/manager path: img and tmp.

`mkdir \-p cocos/cmd/manager/img cocos/cmd/manager/tmp`

Copy the downloaded files to cocos/cmd/manager/img.

```shell
wget https://github.com/ultravioletrs/cocos/releases/download/v0.6.0/bzImage \-P cocos/cmd/manager/img  
wget https://github.com/ultravioletrs/cocos/releases/download/v0.6.0/rootfs.cpio.gz \-P cocos/cmd/manager/img
```

If you are using the latest version of Cocos and require building HAL from source, refer to the Developer Guide for detailed instructions.

### OVMF

We require [Open Virtual Machine Firmware (OVMF)](https://wiki.ubuntu.com/UEFI/OVMF). OVMF is an open-source UEFI firmware implementation from Intel's tianocore project, used by QEMU virtual machines. It is necessary to run virtual machines, especially those based on cloud images like focal-server-cloudimg-amd64.

When QEMU is installed, you typically get two important OVMF files: OVMF\_VARS.fd and OVMF\_CODE.fd. We will make a local copy of OVMF\_VARS.fd because a VM modifies this file during its lifecycle. OVMF\_CODE.fd is used as a read-only reference, so we only need to record its path in an environment variable.

**Locating OVMF\_CODE.fd files:**

```shell
sudo find / \-name OVMF\_CODE.fd
```

Example output:

```shell
/usr/share/edk2/ia32/OVMF\_CODE.fd  
/usr/share/edk2/x64/OVMF\_CODE.fd  
/usr/share/OVMF/OVMF\_CODE.fd
```

**Locating OVMF.fd files (older systems might use this name):**

```shell
sudo find / \-name OVMF.fd
```

Example output:

```shell
/usr/share/edk2/ia32/OVMF.fd  
/usr/share/edk2/x64/OVMF.fd  
/usr/share/OVMF/OVMF.fd
```

**Locating OVMF\_VARS.fd file:**

```shell
sudo find / \-name OVMF\_VARS.fd
```

Example output:

```shell
/usr/share/edk2/ia32/OVMF\_VARS.fd  
/usr/share/edk2/x64/OVMF\_VARS.fd  
/usr/share/OVMF/OVMF\_VARS.fd
```

### Generating Keys

To enable secure communication between the user and the agent via the CLI, you must generate a public/private RSA key pair.

Navigate to the project root and build the CLI tool:

```shell
cd cocos  
make cli
```

Use the CLI to generate the keys:

```shell
./build/cocos-cli keys
```

You should see output similar to:

```shell
Successfully generated public/private key pair of type: rsa
```

The generated keys will be saved in the current directory as:

* public.pem — the public key.  
* private.pem — the private key.

### Starting CVMS Server

The agent includes a CVMS gRPC client, which requires a corresponding gRPC server to communicate with. For testing purposes, an example server is provided in the test/cvms directory.

#### Finding Your IP Address

When running the CVMS server, ensure you use an IP address that is reachable from the virtual machine — avoid using localhost if the VM is on a different network or requires external access. To determine your host machine's IP address, you can run:

```shell
ip a
```

Look for your primary network interface (e.g., wlan0 for WiFi or eth0 for Ethernet) and note the inet IP address. For example:

```shell
2: wlan0: \<BROADCAST,MULTICAST,UP,LOWER\_UP\> mtu 1500 qdisc noqueue state UP group default qlen 1000  
    link/ether 12:34:56:78:9a:bc brd ff:ff:ff:ff:ff:ff  
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic noprefixroute wlan0
```

In this example, the IP address is 192.168.1.100. This address should be used both when launching the CVMS server and when configuring the CVM using the Manager tool.

#### Run the Server

To run the test CVMS server, use the following command:

```shell
HOST=\<externally\_accessible\_ip\> go run ./test/cvms/main.go \\  
    \-algo-path \<algo-path\> \\  
    \-public-key-path \<public-key-path\> \\  
    \-data-paths \<data-paths\> \\  
    \-attested-tls-bool \<attested-tls-bool\> \\  
    \-ca-url \<ca\_url\> \\  
    \-cmv-id \<cvm\_uuid\> \\  
    \-client-ca-file \<path\_to\_client\_ca\_file\_within\_the\_CVM\>
```

#### Parameter Descriptions

* \-`data-paths`: Can be left empty, or provided as a single file path or a comma-separated list of file paths, depending on the algorithm and data type requirements.  
* \-`attested-tls-bool`: Set to true if Attested TLS (aTLS) is required for secure communication; otherwise, use false.  
* \-`ca-url` and \-`cvm-id`: These parameters are required if the agent needs to obtain a certificate from a Certificate Authority (CA). If not provided, the agent will use a self-signed certificate.  
* \-`client-ca-file`: This parameter is required for mutual TLS (mTLS) or mutual attested TLS (maTLS), specifying the path to the client CA certificate file within the CVM.
* \-`algo-path`: The path to the [algorithm](./algorithms.md) file to be executed in the computation.
* \-`public-key-path`: This is the public key used in the [computation manifest](./computation.md) to identify the user when uploading or downloading assets from agent.

For example:

```shell
HOST="192.168.1.41" go run ./test/cvms/main.go \\  
    \-algo-path ./test/manual/algo/addition.py \\  
    \-public-key-path ./public.pem \\  
    \-attested-tls-bool false
```

In this example, no data files are provided, as the addition.py algorithm does not require input datasets.

Expected Output:

```json
{"time":"2025-06-25T14:52:58.693344502+02:00","level":"INFO","msg":"cvms\_test\_server service gRPC server listening at 192.168.1.41:7001 without TLS"}
```

The test server uses the specified algorithm and data file paths to compute file checksums (sha3 256), which are then included in the computation manifest. These files are later uploaded to the agent via the CLI. The provided public key can be generated using either OpenSSL or the cocos-cli tool.

## Running Manager

### Environment Variable Configuration Options

The Manager's behavior is primarily controlled through environment variables. These variables configure aspects like network settings, logging verbosity, and QEMU parameters. The Manager service is configured using the environment variables listed below. Note that any unset variables will be replaced with their default values, which are defined in manager/qemu/config.go.

| Variable | Description | Default Value (from config.go or README.md) |
| :---- | :---- | :---- |
| COCOS\_JAEGER\_URL | The URL for the Jaeger tracing endpoint. | http://localhost:4318 |
| COCOS\_JAEGER\_TRACE\_RATIO | The ratio of traces to sample. | 1.0 |
| MANAGER\_INSTANCE\_ID | The instance ID for the manager service. | (empty) |
| MANAGER\_ATTESTATION\_POLICY\_BINARY | The file path for the attestation policy binary. | ../../build/attestation\_policy |
| MANAGER\_IGVMMEASURE\_BINARY | The file path for the igvmmeasure binary. | ../../build/igvmmeasure |
| MANAGER\_PCR\_VALUES | The file path for the file with the expected PCR values. | (empty) |
| MANAGER\_GRPC\_CLIENT\_CERT | The file path for the client certificate for gRPC communication. | (empty) |
| MANAGER\_GRPC\_CLIENT\_KEY | The file path for the client private key for gRPC communication. | (empty) |
| MANAGER\_GRPC\_SERVER\_CA\_CERTS | The file path for the server CA certificate(s) for gRPC communication. | (empty) |
| MANAGER\_GRPC\_URL | The URL for the gRPC endpoint of the Computation Management Service. | localhost:7001 |
| MANAGER\_GRPC\_TIMEOUT | The timeout for gRPC requests. | 60s |
| MANAGER\_EOS\_VERSION | The EOS version used for booting CVMs. | (empty) |
| MANAGER\_QEMU\_MEMORY\_SIZE | The total memory size for the virtual machine. Can be specified in a human-readable format like "2048M" or "4G". | 2048M |
| MANAGER\_QEMU\_MEMORY\_SLOTS | The number of memory slots for the virtual machine. | 5 |
| MANAGER\_QEMU\_MAX\_MEMORY | The maximum memory size for the virtual machine. Can be specified in a human-readable format like "30G". | 30G |
| MANAGER\_QEMU\_OVMF\_CODE\_IF | The interface type for the OVMF code (e.g., pflash). | pflash |
| MANAGER\_QEMU\_OVMF\_CODE\_FORMAT | The format of the OVMF code file (e.g., raw). | raw |
| MANAGER\_QEMU\_OVMF\_CODE\_UNIT | The unit number for the OVMF code. | 0 |
| MANAGER\_QEMU\_OVMF\_CODE\_FILE | The file path for the OVMF code. | /usr/share/OVMF/OVMF\_CODE.fd |
| MANAGER\_QEMU\_OVMF\_VERSION | The version number of EDKII from which OVMF was built. | (empty) |
| MANAGER\_QEMU\_OVMF\_CODE\_READONLY | Whether the OVMF code should be read-only (on or off). | on |
| MANAGER\_QEMU\_OVMF\_VARS\_IF | The interface type for the OVMF variables (e.g., pflash). | pflash |
| MANAGER\_QEMU\_OVMF\_VARS\_FORMAT | The format of the OVMF variables file (e.g., raw). | raw |
| MANAGER\_QEMU\_OVMF\_VARS\_UNIT | The unit number for the OVMF variables. | 1 |
| MANAGER\_QEMU\_OVMF\_VARS\_FILE | The file path for the OVMF variables. This file is copied to a temporary location for each VM. | /usr/share/OVMF/OVMF\_VARS.fd |
| MANAGER\_QEMU\_NETDEV\_ID | The ID for the network device (e.g., vmnic). | vmnic |
| MANAGER\_QEMU\_HOST\_FWD\_AGENT | The host port number for forwarding agent communication. | 7020 |
| MANAGER\_QEMU\_GUEST\_FWD\_AGENT | The guest port number for forwarding agent communication. | 7002 |
| MANAGER\_QEMU\_VIRTIO\_NET\_PCI\_DISABLE\_LEGACY | Whether to disable the legacy PCI device for virtio-net (on or off). | on |
| MANAGER\_QEMU\_VIRTIO\_NET\_PCI\_IOMMU\_PLATFORM | Whether to enable the IOMMU platform for the virtio-net PCI device (true or false). | true |
| MANAGER\_QEMU\_VIRTIO\_NET\_PCI\_ADDR | The PCI address for the virtio-net PCI device. | 0x2 |
| MANAGER\_QEMU\_VIRTIO\_NET\_PCI\_ROMFILE | The file path for the ROM image for the virtio-net PCI device. | (empty) |
| MANAGER\_QEMU\_DISK\_IMG\_KERNEL\_FILE | The file path for the kernel image (bzImage). | img/bzImage |
| MANAGER\_QEMU\_DISK\_IMG\_ROOTFS\_FILE | The file path for the root filesystem image (rootfs.cpio.gz). | img/rootfs.cpio.gz |
| MANAGER\_QEMU\_SEV\_SNP\_ID | The ID for the Secure Encrypted Virtualization (SEV-SNP) device. | sev0 |
| MANAGER\_QEMU\_SEV\_SNP\_CBITPOS | The position of the C-bit in the physical address for SEV-SNP. | 51 |
| MANAGER\_QEMU\_SEV\_SNP\_REDUCED\_PHYS\_BITS | The number of reduced physical address bits for SEV-SNP. | 1 |
| MANAGER\_QEMU\_ENABLE\_HOST\_DATA | Enable additional data for the SEV-SNP host (true or false). | false |
| MANAGER\_QEMU\_HOST\_DATA | Additional data for the SEV-SNP host. | (empty) |
| MANAGER\_QEMU\_TDX\_ID | The ID for the Trust Domain Extensions (TDX) device. | tdx0 |
| MANAGER\_QEMU\_QUOTE\_GENERATION\_PORT | The port number for virtual socket used to communicate with the Quote Generation Service (QGS) for TDX. | 4050 |
| MANAGER\_QEMU\_OVMF\_FILE | The file path for the OVMF file (combined OVMF\_CODE and OVMF\_VARS file) for TDX. | /usr/share/ovmf/OVMF.fd |
| MANAGER\_QEMU\_IGVM\_ID | The ID of the IGVM file. | igvm0 |
| MANAGER\_QEMU\_IGVM\_FILE | The file path to the IGVM file. | /root/coconut-qemu.igvm |
| MANAGER\_QEMU\_BIN\_PATH | The file path for the QEMU binary. | qemu-system-x86\_64 |
| MANAGER\_QEMU\_USE\_SUDO | Whether to use sudo to run QEMU (true or false). | false |
| MANAGER\_QEMU\_ENABLE\_SEV\_SNP | Whether to enable Secure Nested Paging (SEV-SNP) (true or false). | true |
| MANAGER\_QEMU\_ENABLE\_TDX | Whether to enable Trust Domain Extensions (TDX) (true or false). | false |
| MANAGER\_QEMU\_ENABLE\_KVM | Whether to enable the Kernel-based Virtual Machine (KVM) acceleration (true or false). | true |
| MANAGER\_QEMU\_MACHINE | The machine type for QEMU (e.g., q35). | q35 |
| MANAGER\_QEMU\_CPU | The CPU model for QEMU (e.g., EPYC). | EPYC |
| MANAGER\_QEMU\_SMP\_COUNT | The number of virtual CPUs. | 4 |
| MANAGER\_QEMU\_SMP\_MAXCPUS | The maximum number of virtual CPUs. | 64 |
| MANAGER\_QEMU\_MEM\_ID | The ID for the memory device. | ram1 |
| MANAGER\_QEMU\_NO\_GRAPHIC | Whether to disable the graphical display (true or false). | true |
| MANAGER\_QEMU\_MONITOR | The type of monitor to use (e.g., pty). | pty |
| MANAGER\_QEMU\_HOST\_FWD\_RANGE | The range of host ports to forward (e.g., 6100-6200). | 6100-6200 |
| MANAGER\_QEMU\_CERTS\_MOUNT | Path to a directory on the host to be mounted inside the CVM for certificates. | (empty) |
| MANAGER\_QEMU\_ENV\_MOUNT | Path to a directory on the host to be mounted inside the CVM for environment variables. | (empty) |

### QEMU Configuration and Management

The Manager dynamically constructs QEMU command-line arguments based on the environment variables defined above and the host's capabilities (SEV-SNP or TDX enabled).

Key aspects include:

* **Virtualization**: KVM acceleration is enabled if MANAGER\_QEMU\_ENABLE\_KVM is true.  
* **Machine, CPU, RAM**: Configured using MANAGER\_QEMU\_MACHINE, MANAGER\_QEMU\_CPU, MANAGER\_QEMU\_SMP\_COUNT, MANAGER\_QEMU\_SMP\_MAXCPUS, MANAGER\_QEMU\_MEMORY\_SIZE, MANAGER\_QEMU\_MEMORY\_SLOTS, and MANAGER\_QEMU\_MAX\_MEMORY.  
* **OVMF**: For non-TEE CVMs, separate OVMF\_CODE.fd and OVMF\_VARS.fd files are used. The OVMF\_VARS.fd file is copied to a unique temporary location for each VM instance to ensure isolation and prevent conflicts.  
* **Networking**: A user-mode network device (-netdev user) is configured with host-to-guest port forwarding for agent communication.  
* **Disk Image**: The kernel (bzImage) and root filesystem (rootfs.cpio.gz) files are specified.  
* **Display**: By default, QEMU runs without a graphical display (-nographic).  
* **File System Mounts (9P)**: The Manager uses 9P (Plan 9 Filesystem) to securely transfer environment variables and TLS certificates from the host to the CVM. This is achieved by mounting host directories (MANAGER\_QEMU\_CERTS\_MOUNT and MANAGER\_QEMU\_ENV\_MOUNT) as virtio-9p-pci devices within the VM.

### Trusted Platform Module (TPM)

The Trusted Platform Module (TPM) plays a fundamental role in this process by providing a tamper-resistant foundation for cryptographic operations, securing sensitive artifacts, measuring system state, and enabling attestation mechanisms.

### IGVM

An IGVM file contains all the necessary information to launch a virtual machine on different virtualization platforms. It includes setup commands for the guest system and verification data to ensure the VM is loaded securely and correctly.

Cocos uses the [COCONUT-SVSM](https://github.com/coconut-svsm/svsm/blob/main/Documentation/docs/installation/INSTALL.md) for the vTPM. The IGVM file contains the OVMF file and the vTPM.

## Deployment

To start the service, execute the following shell script (note a server needs to be running see [here](https://github.com/ultravioletrs/cocos/blob/main/test/cvms/README.md)):

The manager can be started as a *systemd* service or a standalone executable. To start the manager as a systemd service, look at the systemd service script [here](https://github.com/ultravioletrs/cocos/blob/main/init/systemd/cocos-manager.service). The environment variables are defined in the cocos-manager.env file. Below are examples of how to start the manager.

```shell
\# Compile the manager  
make manager

\# Set the environment variables and run the service  
MANAGER\_GRPC\_URL=localhost:7001 \\  
MANAGER\_LOG\_LEVEL=debug \\  
MANAGER\_QEMU\_USE\_SUDO=false \\  
./build/cocos-manager
```

To start SEV-SNP, define the IGVM file that contains the vTPM and the OVMF (combined OVMF\_CODE and OVMF\_VARS) of the CVM.

To enable [AMD SEV-SNP](https://www.amd.com/en/developer/sev.html) support, start manager like this

```shell
MANAGER\_GRPC\_URL=localhost:7001 \\  
MANAGER\_LOG\_LEVEL=debug \\  
MANAGER\_QEMU\_ENABLE\_SEV\_SNP=true \\  
MANAGER\_QEMU\_SEV\_SNP\_CBITPOS=51 \\  
MANAGER\_QEMU\_BIN\_PATH=\<path to QEMU binary\> \\  
MANAGER\_QEMU\_IGVM\_FILE=\<path to IGVM file\> \\  
./build/cocos-manager
```

To enable [TDX](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html) support, start manager like this

```shell
MANAGER\_GRPC\_URL=localhost:7001 \\  
MANAGER\_LOG\_LEVEL=debug \\  
MANAGER\_QEMU\_ENABLE\_SEV\_SNP=false \\  
MANAGER\_QEMU\_ENABLE\_TDX=true \\  
MANAGER\_QEMU\_CPU=host \\  
MANAGER\_QEMU\_OVMF\_FILE=\<path to OVMF file\> \\  
./build/cocos-manager
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

## Operational Procedures and Best Practices

To ensure efficient and secure operation of the Manager, consider the following procedures and best practices:

1. **Resource Allocation**:  
   * **Memory**: Configure MANAGER\_QEMU\_MEMORY\_SIZE, MANAGER\_QEMU\_MEMORY\_SLOTS, and MANAGER\_QEMU\_MAX\_MEMORY appropriately based on the expected workload of the CVMs. Over-provisioning can waste resources, while under-provisioning can lead to performance bottlenecks.  
   * **CPU**: Adjust MANAGER\_QEMU\_SMP\_COUNT and MANAGER\_QEMU\_SMP\_MAXCPUS to match the computational requirements of your algorithms and the host's capabilities.  
2. **Security Hardening**:  
   * **TLS/mTLS**: Always use TLS for gRPC communication (MANAGER\_GRPC\_CLIENT\_CERT, MANAGER\_GRPC\_CLIENT\_KEY, MANAGER\_GRPC\_SERVER\_CA\_CERTS) in production environments to secure data in transit. For enhanced security, configure mutual TLS (mTLS) if supported by your deployment.  
   * **Attestation**: Ensure that SEV-SNP or TDX are properly enabled and configured (MANAGER\_QEMU\_ENABLE\_SEV\_SNP, MANAGER\_QEMU\_ENABLE\_TDX, MANAGER\_QEMU\_SEV\_SNP\_CBITPOS, MANAGER\_QEMU\_SEV\_SNP\_REDUCED\_PHYS\_BITS, MANAGER\_QEMU\_TDX\_ID, MANAGER\_QEMU\_QUOTE\_GENERATION\_PORT, MANAGER\_QEMU\_OVMF\_FILE, MANAGER\_QEMU\_IGVM\_FILE). Regularly verify attestation reports to confirm the integrity of the TEEs.  
   * **File System Permissions**: Ensure that the directories specified for MANAGER\_QEMU\_CERTS\_MOUNT and MANAGER\_QEMU\_ENV\_MOUNT have appropriate permissions to prevent unauthorized access to sensitive configuration data.  
3. **Graceful Shutdown**: When stopping the Manager or individual CVMs, use the recommended shutdown procedures (e.g., SIGTERM for QEMU processes) to ensure data integrity and proper resource deallocation. Avoid forceful termination (kill \-9) unless absolutely necessary, as it can lead to corrupted states.  
4. **Version Management**: Keep your Cocos Manager, Agent, and HAL components updated to the latest stable versions to benefit from bug fixes, performance improvements, and security patches.  
5. **Network Configuration**:  
   * Verify that host-to-guest port forwarding rules (MANAGER\_QEMU\_HOST\_FWD\_AGENT, MANAGER\_QEMU\_GUEST\_FWD\_AGENT, MANAGER\_QEMU\_HOST\_FWD\_RANGE) are correctly set up and do not conflict with other services on the host.

## Monitoring and Logging Capabilities

Effective monitoring and logging are essential for maintaining the health and security of your Cocos deployment.

1. **Manager Logs**:  
   * **Log Level**: Configure the MANAGER\_LOG\_LEVEL environment variable (debug, info, warn, error) to control the verbosity of Manager logs. For production, info or warn is typically sufficient, while debug is useful for troubleshooting.  
   * **Accessing Logs**: Manager logs are typically output to stdout and stderr. When running as a systemd service, these logs can be accessed using journalctl \-u cocos-manager.service.  
   * **Jaeger Tracing**: The Manager supports Jaeger tracing for distributed tracing. Configure COCOS\_JAEGER\_URL and COCOS\_JAEGER\_TRACE\_RATIO to integrate with a Jaeger instance, allowing you to trace requests across different Cocos components.  
2. **CVM (Agent)**:  
   * **Process Monitoring**: Use ps aux | grep cocos-agent on the host to verify if the cocos-agent process is running inside the CVM.  
   * **Network Connectivity**: Use nc \-zv localhost \<host\_forwarded\_agent\_port\> (e.g., nc \-zv localhost 7020\) to check if the Agent is reachable from the host machine.  
3. **System Health Monitoring**:  
   * Monitor host machine resources (CPU, memory, disk I/O, network usage) to ensure sufficient capacity for running multiple CVMs.  
   * Implement alerts for critical events such as CVM crashes, attestation failures, or resource exhaustion.

## Error Handling and Recovery Procedures

The Manager is designed with robustness in mind, but issues can still arise. Here's how to approach error handling and recovery:

1. **Defunct (Zombie) QEMU Processes**:  
   * **Problem**: If ps aux | grep qemu-system-x86\_64 shows \<defunct\> processes, it indicates that a QEMU virtual machine has terminated but its entry in the process table remains.  
   * **Troubleshooting**:  
     * **Check Manager Logs**: Review Manager logs (configured with MANAGER\_LOG\_LEVEL=info) for the QEMU command that was executed. The log will contain the full QEMU command string.  
     * **Manual QEMU Execution**: Copy the QEMU command from the Manager logs and run it directly in your terminal. This will often reveal specific error messages from QEMU that were not immediately apparent in the Manager's output.  
     * **Environment Variable Review**: Based on QEMU's error messages, re-examine the MANAGER\_QEMU\_ environment variables in your setup. Common issues include incorrect file paths for OVMF, kernel, or rootfs images, or misconfigured network settings. Refer to the "Environment Variable Configuration Options" table and manager/qemu/config.go for default values and descriptions.  
   * **Recovery**:  
     * **Graceful Kill**: Attempt to gracefully terminate leftover QEMU processes using pkill \-f qemu-system-x86\_64. This sends a SIGTERM signal, allowing QEMU to clean up resources.  
     * **Forceful Kill**: If graceful termination fails, use kill \-9 \<PID\> to forcefully terminate the zombie process. Identify the PID from ps aux.  
2. **Attestation Failures**:  
   * **Problem**: CVMs fail to launch or report integrity issues during attestation.  
   * **Troubleshooting**:  
     * **Verify Hardware Support**: Ensure your host machine fully supports AMD SEV-SNP or Intel TDX and that the necessary kernel modules are loaded and enabled.  
     * **IGVM/OVMF Paths**: Double-check the paths for MANAGER\_QEMU\_IGVM\_FILE (for SEV-SNP) or MANAGER\_QEMU\_OVMF\_FILE (for TDX) to ensure they are correct and accessible.  
     * **PCR Values**: If MANAGER\_PCR\_VALUES is used, verify that the expected PCR values match the actual measurements from the TEE.  
     * **Manager Logs**: Look for specific attestation error messages in the Manager logs.  
   * **Recovery**:  
     * Address underlying hardware or configuration issues.  
     * Rebuild or re-download IGVM/OVMF files if they are suspected to be corrupted.  
3. **Network Connectivity Issues**:  
   * **Problem**: The Agent inside the CVM cannot communicate with external services.  
   * **Troubleshooting**:  
     * **Firewall Rules**: Verify that host firewalls are not blocking necessary ports (e.g., 7020 for host-to-guest agent forwarding).  
     * **Network Device Configuration**: Check MANAGER\_QEMU\_NETDEV\_ID, MANAGER\_QEMU\_HOST\_FWD\_AGENT, MANAGER\_QEMU\_GUEST\_FWD\_AGENT for correct network device and port forwarding setup.  
   * **Recovery**:  
     * Adjust firewall rules.  
     * Correct IP address or port configurations.  
     * Restart Manager and CVMs after network changes.  
4. **Resource Exhaustion**:  
   * **Problem**: CVMs perform poorly, crash, or fail to launch due to insufficient host resources (memory, CPU).  
   * **Troubleshooting**:  
     * Monitor host resource utilization using tools like top, htop, free \-h.  
     * Check Manager and CVM logs for out-of-memory errors or CPU starvation warnings.  
   * **Recovery**:  
     * Increase host machine resources (RAM, CPU cores).  
     * Reduce the number of concurrent CVMs.  
     * Optimize CVM memory and CPU allocations in the Manager's environment variables.

## Usage

For more information about service capabilities and its usage, please check out the [README documentation](https://github.com/ultravioletrs/cocos/blob/main/manager/README.md).
