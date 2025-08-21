# On-premises

## Overview

To keep the CVM as small as possible and ensure that secrets passed into the CVM are destroyed upon computation completion, the HAL provides an in-RAM CVM. Without the disk, the attack surface is smaller, and because there is no persistent state, the data and code provided to the CVM are destroyed upon shutdown.

HAL is a layer of programming that allows the software to interact with the hardware device at a general level rather than at the detailed hardware level. Cocos uses HAL and AMD SEV-SNP or Intel TDX as an abstraction layer for confidential computing.

AMD SEV-SNP and Intel TDX technology enable the creation of confidential virtual machines (CVMs). VMs are usually used to run an operating system (e.g., Ubuntu and its applications). To avoid using a whole OS, HAL uses:

- Virtual Trusted Platform Module (vTPM) that is part of the CVM, and thus is part of the measurement of the CVM. The implementation of such vTPM is found at the [COCONUT-SVSM repository](https://github.com/coconut-svsm/svsm). This vTPM is only available for SEV-SNP. TDX support will be added in the future.
- Open Virtual Machine Firmware (OVMF) - a custom OVMF with support for COCONUT-SVSM vTPM or with support for TDX.
- Custom Linux kernel v6.11 - bzImage archive with the custom Linux kernel v6.11 with support for AMD SEV-SNP and Intel TDX. This custom version of the kernel also supports COCONUT-SVSM, or the virtual TPM.
- File system - the initial RAM file system (initramfs) that is used as the root file system of the CVM.

This way, applications can be executed in the CVM, and the whole HAL CVM is entirely in RAM, protected by SEV-SNP and TDX. Being a RAM-only CVM means that secrets stored in the CVM will never leave the CVM and will be destroyed when the CVM is shut down.

## Virtual TPM

The vTPM is part of the CVM in the case of SEV-SNP. To understand how the vTPM is loaded, we need to talk about SEV-SNP VM privilege levels (VMPL). VMPL allows users to divide the SEV-SNP address space in four levels (from 0 to 3). These levels are hardware-enforced and can be used for additional security control within the CVM. All levels have a priority; level 0, or VMPL0, has the highest priority, while VMPL3 has the lowest. VMPL provides a feature like nested virtualization. For example, software loaded into VMPL0 can act as a security enforcer and control permission on all pages in guest memory. These pages would not be able to be altered by the software in the upper layers because of the hardware-enforced priority.

COCONUT-SVSM utilizes this mechanism to load the vTPM into the VMPL0 layer and load the OS into the VMPL2 layer. The vTPM can then run without the interference of the OS, and the user can trust the vTPM attestation report because vTPM is running in VMPL0 and is backed by SEV-SNP. The COCONUT-SVSM team provides instructions on how to build the vTPM. The output of the build is a single IGVM file that can be used to boot CVMs with vTPM support. The [build instructions](https://github.com/coconut-svsm/svsm/blob/main/Documentation/docs/installation/INSTALL.md#building-the-coconut-svsm) are available in the COCONUT-SVSM repository.

## Open Virtual Machine Firmware (OVMF)

OVMF (Open Virtual Machine Firmware) provides UEFI firmware for VMs, enabling modern boot and runtime services in virtualized environments. It is based on the EDK II (EFI Development Kit II) open-source implementation, OVMF is designed to replace traditional BIOS with a more flexible, modular, and secure firmware standard. It supports features like Secure Boot, GPT partitioning, and booting from EFI applications.

HAL uses the modified versions of OVMF in order to boot AMD and Intel CVMs. For AMD SEV-SNP, the COCONUT-SVSM [OVMF](https://github.com/coconut-svsm/svsm/blob/main/Documentation/docs/installation/INSTALL.md#building-the-guest-firmware) is used in order for the software inside the HAL to communicate with the vTPM. Similarly, a modified OVMF for Intel TDX is used to utilize the TDX platform fully.

## Linux kernel

The Linux kernel is responsible for managing system resources, hardware interactions, and process control in a Linux OS. It provides essential services, including memory management, file systems, networking, and device drivers. The Linux kernel that HAL uses is a custom v6.11 kernel with support for AMD SEV-SNP, including the vTPM, and Intel TDX support.

The kernel's behavior is altered with kernel command-line parameters. The parameters that Cocos uses are  `console=null quiet`. The meaning behind these values is:

- `console=null` disables all the kernel console output.
- `quiet` tells the kernel not to produce any output.

## Initramfs

Buildroot is used to create an in-RAM file system, and Cocos uses initramfs. Initramfs is a temporary file system used to mount the root filesystem; however, Cocos uses initramfs as its primary file system. This way, the CVM is only located in RAM and its contents are destroyed when the CVM is shut down.

Cocos configures Buildroot to incorporate support for WASM, Python, and Docker into the initramfs, making it highly versatile for running a wide range of applications. The iniramfs also includes the Agent. The iniramfs is configured to start the Agent as a systemd service. SSH is also disabled to prevent unauthorized access to the CVM.

## How is HAL constructed?

HAL is made using the tool Buildroot. Buildroot is used to create efficient, embedded Linux systems, and we use it to create the compressed image of the kernel (bzImage) and the initial file system (initramfs). You can find the Buildroot configuration at the Cocos [repository](https://github.com/ultravioletrs/cocos/tree/main/hal/linux).

HAL configuration for Buildroot also includes Python, WASM, and Docker runtime and the Agent software support. You can read more about the [Agent software](agent.md).

## How does it work?

HAL is combined with AMD SEV-SNP or Intel TDX to provide a fully encrypted VM that can be verified using remote attestation. You can read more about the [attestation process](attestation-introduction.mdx).

### AMD SEV-SNP

Cocos uses QEMU and OVMF to boot the CVMs. During boot with SEV-SNP, the AMD Secure Processor (AMD SP) measures (calculates the hash) of the contents of the VM to insert that hash into the attestation report. This measurement is proof of what is currently running inside the VM.

SEV-SNP is used to measure OVMF. To determine which kernel is running in the CVM and which file system, the vTPM is utilized for this purpose. The OVMF and vTPM are loaded into memory when the initial CVM memory is loaded. During this process, the SEV-SNP measures this initial memory, thereby assessing the OVMF and vTPM. The rest of the HAL, the kernel, and the initramfs are hashed, and their hashed values are used to extend the values of the Platform Configuration Registers (PCRs) of the vTPM. The OVMF calculates the hash of the kernel and uses it to extend the value of PCR4. Then, the kernel calculates the hash of the initramfs and the kernel command line and uses these values to extend the value of PCR9. The content of the PCRs is trusted because the vTPM is running inside the CVM and in layer VMPL0. The whole HAL can be seen in the following diagram. The green color represents the trusted part of the system, while the red represents the untrusted part.

![hal](/img/hal_snp.png)

Cocos uses the COCONUT-SVSM QEMU version in order to boot an SEV-SNP CVM. An example of a QEMU command to boot the HAL is shown below.

```bash
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

### Intel TDX

Cocos uses QEMU and OVMF to boot the Trust Domain (TD). TD is the Intel synonym for a CVM. During boot, the Intel TDX Module measures (calculates the hash) of the contents of the CVM to insert that hash into the attestation report.

Cocos uses QEMU and OVMF to boot the Trust Domain (TD). TD is the Intel synonym for a CVM. During boot, the Intel TDX Module measures (calculates the hash) of the contents of the CVM to insert that hash into the attestation report. The kernel and initramfs are measured using CVMs (TDs) Runtime Measurement Registers (RTMRs). There are four RTMRs.

- RTMR0 stores the measurement of the virtual firmware data (static configuration and dynamic configuration). OVMF extends this RTMR.
- RTMR1 stores the measurement of the Linux kernel. OVMF extends this RTMR.
- RTMR2 stores the measurement of initramfs and the kernel command line. Linux kernel extends this RTMR. Linux kernel also extends this RTMR with measurements of OS applications.
- RTMR3 is empty and can be used freely.

RTMR registers are extended in the same way as the PCR registers of the vTPM.

![hal](/img/hal_tdx.png)

Cocos uses the [canonical/tdx](https://github.com/canonical/tdx/tree/main) QEMU version in order to boot an Intel TD (CVM). An example of a QEMU command to boot the HAL is shown below.

```bash

KERNEL=buildroot/output/images/bzImage
INITRD=buildroot/output/images/rootfs.cpio.gz
OVMF=/usr/share/ovmf/OVMF.fd

sudo qemu-system-x86_64 \
    -enable-kvm \
    -m 8G -smp cores=16,sockets=1,threads=1 \
    -cpu host \
    -object '{"qom-type":"tdx-guest","id":"tdx","quote-generation-socket":{"type": "vsock", "cid":"2","port":"4050"}}' \
    -machine q35,kernel_irqchip=split,confidential-guest-support=tdx,memory-backend=mem0,hpet=off \
    -bios $OVMF \
    -nographic \
    -nodefaults \
    -no-reboot \
    -serial mon:stdio \
    -device virtio-net-pci,netdev=nic0_td \
    -netdev user,id=nic0_td,hostfwd=tcp::7020-:7002 \
    -kernel $KERNEL \
    -append "console=null quiet" \
    -object memory-backend-memfd,id=mem0,size=8G \
    -initrd $INITRD \
    -device vhost-vsock-pci,guest-cid=6 \
    -monitor pty \
    -monitor unix:monitor,server,nowait \
    -fsdev local,id=env_fs,path=$ENV_PATH,security_model=mapped \
    -device virtio-9p-pci,fsdev=env_fs,mount_tag=env_share \
    -fsdev local,id=cert_fs,path=$CERTH_PATH,security_model=mapped \
    -device virtio-9p-pci,fsdev=cert_fs,mount_tag=certs_share
```

The parameter

```bash
-object '{"qom-type":"tdx-guest","id":"tdx","quote-generation-socket":{"type": "vsock", "cid":"2","port":"4050"}}' \
```

is used to define the `vsock` channel of communication with the Quote Generation Service that issues the Quote (Intel TDX attestation report) to the Agent.

## Debugging

### How to log in the CVM?

You can modify the above-defined QEMU commands to view and log in to the CVM. To do this, change the `append` QEMU command parameter to `console=ttyS0`. When the login screen is shown, log in by typing `root` in the terminal. After logging in, you can use the `bash` terminal to investigate the CVM further or to see the Agent service status.

### What to do if the CVM crashes?

You can check the RAM usage using the `free -h`. The output would be something like this.

```bash
               total        used        free      shared  buff/cache   available
Mem:           243Gi        10Gi       112Gi       278Mi       122Gi       233Gi
Swap:          8.0Gi          0B       8.0Gi

```

If usage is high and there is little or no free memory, there is a high likelihood that the CVM will crash. If that is the case, shut down the CVM and free some memory, then relaunch the CVM.

## Conclusion

Using HAL guarantees that the whole VM is secure and can be verified.

After the kernel boots, the Agent is started and ready for work.
