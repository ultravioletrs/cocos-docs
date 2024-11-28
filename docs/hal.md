# Hardware Abstraction Layer (HAL)

HAL is a layer of programming that allows the software to interact with the hardware device at a general level rather than at the detailed hardware level. Cocos uses HAL and AMD SEV-SNP as an abstraction layer for confidential computing.

AMD SEV-SNP creates secure virtual machines (SVMs). VMs are usually used to run an operating system (e.g., Ubuntu and its applications). To avoid using a whole OS, HAL uses:

- Linux kernel v6.12 - vmlinuz archive with the standard Linux kernel v6.12 with support for AMD SEV.
- File system - the initial RAM file system (initramfs) that is used as the root file system of the VM.

This way, applications can be executed in the SVM, and the whole HAL SVM is entirely in RAM, protected by SEV-SNP. Being a RAM-only SVM means that secrets that are kept in the SVM will be destroyed when the SVM stops working.

## How is HAL constructed?

HAL is made using the tool Buildroot. Buildroot is used to create efficient, embedded Linux systems, and we use it to create the compressed image of the kernel (vmlinuz) and the initial file system (initramfs).

HAL configuration for Buildroot also includes Python runtime and agent software support. You can read more about the Agent software [here](agent.md).

## How does it work?

HAL is combined with AMD SEV-SNP to provide a fully encrypted VM that can be verified using remote attestation. You can read more about the attestation process [here](attestation.md).

Cocos uses QEMU and Open Virtual Machine Firmware (OVMF) to boot the confidential VM. During boot with SEV-SNP, the AMD Secure Processor (AMD SP) measures (calculates the hash) of the contents of the VM to insert that hash into the attestation report. This measurement is proof of what is currently running inside the VM. The problem with SEV is that it only measures the Open Virtual Machine Firmware (OVMF). To solve this, we have built OVMF so that OVMF contains hashes of the vmlinuz and initrams. Once the OVMF is loaded, it will load the vmlinuz and initramfs into memory, but it will continue the boot process only if the hashes of the vmlinuz and initramfs match the hashes stored in OVMF. This way, the attestation report will contain the measurement of OVMF, with the hashes, and OVMF will guarantee that the correct kernel and file system are booted. The whole process can be seen in the following diagram. The green color represents the trusted part of the system, while the red is untrusted:

![hal](./img/hal.png){ align=center }

This process guarantees that the whole VM is secure and can be verified.

After the kernel boots, the agent is started and ready for work.
