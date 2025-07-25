# Hardware Abstraction Layer (HAL)

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

COCONUT-SVSM utilizes this mechanism to load the vTPM into the VMPL0 layer and load the OS into the VMPL2 layer. The vTPM can then run without the interference of the OS, and the user can trust the vTPM attestation report because vTPM is running in VMPL0 and is backed by SEV-SNP.

## Open Virtual Machine Firmware (OVMF)

OVMF (Open Virtual Machine Firmware) provides UEFI firmware for VMs, enabling modern boot and runtime services in virtualized environments. It is based on the EDK II (EFI Development Kit II) open-source implementation, OVMF is designed to replace traditional BIOS with a more flexible, modular, and secure firmware standard. It supports features like Secure Boot, GPT partitioning, and booting from EFI applications.

HAL uses the modified versions of OVMF in order to boot AMD and Intel CVMs. For AMD SEV-SNP, the COCONUT-SVSM OVMF is used in order for the software inside the HAL to communicate with the vTPM. Similarly, a modified OVMF for Intel TDX is used in order to fully utilize the TDX platform.

## How is HAL constructed?

HAL is made using the tool Buildroot. Buildroot is used to create efficient, embedded Linux systems, and we use it to create the compressed image of the kernel (bzImage) and the initial file system (initramfs).

HAL configuration for Buildroot also includes Python, WASM, and Docker runtime and the Agent software support. You can read more about the Agent software [here](agent.md).

## How does it work?

HAL is combined with AMD SEV-SNP or Intel TDX to provide a fully encrypted VM that can be verified using remote attestation. You can read more about the attestation process [here](attestation.mdx).

### AMD SEV-SNP

Cocos uses QEMU and OVMF to boot the CVMs. During boot with SEV-SNP, the AMD Secure Processor (AMD SP) measures (calculates the hash) of the contents of the VM to insert that hash into the attestation report. This measurement is proof of what is currently running inside the VM.

SEV-SNP is used to measure OVMF. To determine which kernel is running in the CVM and which file system, the vTPM is utilized for this purpose. The OVMF and vTPM are loaded into memory when the initial CVM memory is loaded. During this process, the SEV-SNP measures this initial memory, thereby assessing the OVMF and vTPM. The rest of the HAL, the kernel, and the initramfs are hashed, and their hashed values are used to extend the values of the Platform Configuration Registers (PCRs) of the vTPM. The OVMF calculates the hash of the kernel and uses it to extend the value of PCR4. Then, the kernel calculates the hash of the initramfs and the kernel command line and uses these values to extend the value of PCR9. The content of the PCRs is trusted because the vTPM is running inside the CVM and in layer VMPL0. The whole HAL can be seen in the following diagram. The green color represents the trusted part of the system, while the red represents the untrusted part.

![hal](/img/hal_snp.png)

### Intel TDX

Cocos uses QEMU and OVMF to boot the Trust Domain (TD). TD is the Intel synonym for a CVM. During boot, the Intel TDX Module measures (calculates the hash) of the contents of the CVM to insert that hash into the attestation report. 

Cocos uses QEMU and OVMF to boot the Trust Domain (TD). TD is the Intel synonym for a CVM. During boot, the Intel TDX Module measures (calculates the hash) of the contents of the CVM to insert that hash into the attestation report. The kernel and initramfs are measured using CVMs (TDs) Runtime Measurement Registers (RTMRs). There are four RTMRs.

- RTMR0 stores the measurement of the virtual firmware data (static configuration and dynamic configuration). OVMF extends this RTMR.
- RTMR1 stores the measurement of the Linux kernel. OVMF extends this RTMR.
- RTMR2 stores the measurement of initramfs and the kernel command line. Linux kernel extends this RTMR. Linux kernel also extends this RTMR with measurements of OS applications.
- RTMR3 is empty and can be used freely.

RTMR registers are extended in the same way as the PCR registers of the vTPM.

![hal](/img/hal_tdx.png)

## Conclusion

This process guarantees that the whole VM is secure and can be verified.

After the kernel boots, the Agent is started and ready for work.
