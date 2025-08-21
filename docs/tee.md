# Trusted Execution Environments(TEEs)

In the context of computing security, "trust" refers to the set of components that must behave correctly to enforce a system’s security guarantees. Traditionally, this trust has centered around the Trusted Computing Base (TCB)—the set of all hardware, software, and firmware components that are critical to a system's security. The smaller and simpler the TCB, the easier it is to reason about, verify, and secure. However, conventional systems have large TCBs that include the OS, hypervisor, and platform firmware, making it difficult to establish strong guarantees. This challenge has motivated the development of Trusted Execution Environments (TEEs), which reduce the TCB to only the code and data necessary for a specific secure workload.

A Trusted Execution Environment (TEE) is a hardware-based, isolated environment designed to protect data and code while in use. Unlike disk encryption, which protects data at rest, and protocols like TLS and VPN, which secure data in transit, Trusted Execution Environments (TEEs) protect data in use—when it is being actively processed in memory.
This isolation ensures that even privileged software such as the OS or hypervisor cannot inspect or tamper with the protected execution.

![TEE use](/img/DataFlow.png)

TEEs are designed to provide three essential security properties for data and code while in use:

- Data Confidentiality: Unauthorized entities cannot view data within the TEE.
- Data Integrity: Unauthorized entities cannot add, remove, or alter data within the TEE.
- Code Integrity: Unauthorized entities cannot add, remove, or alter the code executing inside the TEE.

Key Components of a TEE:

| Feature                | Description                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Hardware Root of Trust | Keys are fused into CPU silicon at manufacturing time. All memory encryption keys are derived internally and never leave the CPU boundary. |
| Memory Protection      | Memory inside the TEE is encrypted with hardware-managed keys. Only the TEE can access it; OS, hypervisors, and cloud providers cannot.    |
| Attestation            | Verifies the authenticity of the TEE hardware and integrity of software running inside it. Enables remote parties to establish trust.      |

Several TEE implementations exist across major CPU architectures, each offering different granularity and deployment models:

- **AMD SEV (Secure Encrypted Virtualization) & Intel TDX (Trust Domain Extensions):**  
  Provide coarse-grained protection at the virtual machine level. These technologies isolate entire VMs from the hypervisor using hardware-enforced memory encryption and integrity mechanisms. They are especially suited for lift-and-shift workloads that cannot be easily partitioned into enclaves, aligning well with cloud-native deployment models.

- **Intel SGX (Software Guard Extensions):**  
  Enables fine-grained protection by allowing designated portions of an application, called _enclaves_, to run in isolated memory regions inaccessible to any other software, including the OS and hypervisor. SGX enforces confidentiality, integrity, and anti-replay through hardware-managed encryption and controlled memory access. Decryption occurs only within the CPU execution context; memory contents are re-encrypted when written back.

- **ARM TrustZone & RISC-V PMP (Physical Memory Protection):**  
  ARM TrustZone partitions the system into secure and non-secure worlds, enabling isolated execution for trusted applications. Emerging architectures like **ARM CCA** (Confidential Compute Architecture) extend this model to virtualized environments. RISC-V’s PMP offers configurable access control over memory regions, forming the basis for TEE implementations in open hardware ecosystems. RISC-V Keystone is an open-source project that builds enclaves using RISC-V's Physical Memory Protection (PMP) for memory isolation. It uses a secure monitor in machine mode to manage enclave memory and PMP entries, enabling strong, hardware-enforced separation without platform-specific changes.

## AMD SEV-SNP

AMD introduced Secure Encrypted Virtualization (SEV) in 2016 to provide memory encryption at the hardware level, isolating VMs from a potentially compromised hypervisor. In 2017, SEV-ES extended this by encrypting CPU register state, adding further protection.
However, encryption alone does not guarantee integrity. A malicious hypervisor could still tamper with memory contents, perform replay attacks, or remap guest memory.

In traditional SEV and SEV-ES, AES (Advanced Encryption Standard) protects guest memory from being read by unauthorized parties—particularly the hypervisor or peripheral devices (via DMA). Each VM’s memory is encrypted with a unique key stored in hardware, and identical plaintexts at different memory locations are encrypted differently (non-deterministic encryption).

However, memory encryption alone does not prevent manipulation of encrypted memory. Since the encryption is performed transparently by the memory controller, any actor who can write to guest physical memory—like a malicious hypervisor—can still:

1. Corrupt Data Injection: Overwriting encrypted memory with random data, causing the guest to load garbage or malicious values.
2. Replay Attacks: Saving and restoring old encrypted memory to reintroduce outdated secrets or credentials.
3. Aliasing & Remapping: Abusing guest memory mappings to:
   - Point multiple guest addresses to the same physical memory (aliasing)
   - Change where a guest address points over time (remapping)

These attacks don’t break encryption—they exploit control over where memory goes and when it’s used.

To address this, AMD introduced SEV-SNP (Secure Nested Paging)—which builds on SEV/SEV-ES by incorporating hardware-enforced memory integrity, stronger isolation, and broader protections against active adversaries in the virtualization stack.

SEV-SNP extends SEV by enforcing strong memory integrity guarantees:

> If a VM reads a private (encrypted) page, it must see exactly the last value it wrote—or get a fault.
> This guarantee holds across all virtualization events: memory swaps, migrations, and hypervisor activity.

This implies:

- Replay attacks are blocked: Stale ciphertext reinserted into guest memory is detected and rejected.
- Corruption is blocked: Guests will either read their expected data or fault if data has been tampered with.
- Aliasing/remapping is blocked: VMs are ensured a consistent, one-to-one mapping between guest and system memory.

SEV-SNP enhances AMD’s virtualization security by adding hardware-enforced memory integrity on top of existing SEV memory encryption. It introduces a Reverse Map Table (RMP) to track memory ownership and enforce access control, ensuring that only the assigned guest VM can modify its encrypted memory. The guest validates memory pages blocking tampering methods like memory remapping, replay, or aliasing. Additional protections include Virtual Machine Privilege Levels (VMPLs) for intra-VM isolation and strict interrupt injection controls to prevent a malicious hypervisor from hijacking guest execution or injecting exceptions at unsafe times.

To ensure platform trust, SEV-SNP uses a Versioned Chip Endorsement Key (VCEK), which cryptographically binds attestation reports to the platform’s firmware version, preventing TCB rollback attacks. Secure VM migration is delegated to a guest-controlled Migration Agent, decoupling it from the untrusted hypervisor. SEV-SNP also mitigates certain side-channel threats: it provides control over the Branch Target Buffer (BTB)—a CPU prediction cache that attackers can exploit—and allows VMs to enable Indirect Branch Restricted Speculation (IBRS) to prevent BTB poisoning. Combined, these features offer robust confidentiality and integrity protections for cloud VMs, even in fully untrusted environments.

![SEV-SNP Threat Model](/img/SEVSNPThreatModel.png)

With SEV-SNP, all software running outside the guest VM—including CPU firmware, PCI devices, the host BIOS, hypervisor, drivers, and other virtual machines—is classified as untrusted, as depicted above. These components are assumed to be potentially hostile and may work together in attempts to breach the isolation and protection offered to SEV-SNP-protected VMs.

### 🔐 SEV-SNP Security Guarantees

| **Security Property**                      | **SEV-SNP Guarantee**  | **How It’s Enforced**                                       |
| ------------------------------------------ | ---------------------- | ----------------------------------------------------------- |
| **Memory confidentiality**                 | ✅ Protected           | Guest memory encrypted using per-VM AES-128 key by hardware |
| **Memory integrity**                       | ✅ Protected           | Enforced by Reverse Map Table (RMP) and `PVALIDATE`         |
| **Replay protection**                      | ✅ Prevented           | RMP enforces one-to-one mapping of guest → physical pages   |
| **Aliasing/remapping**                     | ✅ Blocked             | RMP detects and rejects remapped or aliased pages           |
| **Corruption detection**                   | ✅ Ensured             | Guest sees only what it last wrote or gets an exception     |
| **Interrupt spoofing**                     | ✅ Optional protection | Controlled via Restricted or Alternate Injection modes      |
| **TCB rollback prevention**                | ✅ Enforced            | Attestation tied to Versioned Chip Endorsement Key (VCEK)   |
| **DMA attacks**                            | ✅ Blocked             | Hardware enforces isolation of encrypted guest memory       |
| **Speculative side channels (Spectre v2)** | ✅ Mitigated           | BTB flushing and guest-controlled IBRS settings             |
| **Intra-VM isolation**                     | ✅ Supported           | Virtual Machine Privilege Levels (VMPL 0–3)                 |

---

### AMD SEV-SNP: System Requirements and Overview

Before setting up AMD SEV-SNP, ensure your system meets the following baseline requirements:

#### AMD Hardware Requirements

| **Component**     | **Requirement**                                   | **Role / Purpose**                                                |
| ----------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| **CPU**           | AMD EPYC Gen 3 (Milan) or newer                   | Supports SEV-SNP hardware instructions                            |
| **BIOS Settings** | `SVM`, `SEV`, `SEV-ES`, `SEV-SNP`, `SMEE` enabled | Enables virtualization and memory encryption features in firmware |
| **SEV Firmware**  | Version ≥ **1.51**                                | Required for SEV-SNP support and attestation                      |

---

#### AMD Software Requirements

| **Component**    | **Requirement**                                                     | **Role / Purpose**                                           |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Linux Kernel** | Kernel version ≥ **6.11**                                           | Provides native SEV-SNP support in the host and guest        |
| **Firmware**     | OVMF                                                                | UEFI firmware that supports SEV-SNP guest boot               |
| **QEMU**         | SEV-SNP-enabled QEMU                                                | Hypervisor capable of launching SEV-SNP VMs                  |
| **Toolchain**    | `build-essential`, `make`, `git`, `curl`, `python3`, `cargo`, `gcc` | Required for building guest images, tools, or kernel modules |

The [kernel configuration instructions](https://github.com/AMDESE/AMDSEV/tree/snp-latest) provide detailed setup information.

### SEV-SNP Host Kernel Setup in Cocos AI

---

In the **Cocos AI** project, the host system was configured to support **AMD SEV-SNP** for launching and attesting confidential workloads. Below is a detailed breakdown of the configuration process used on the host:

#### 🔧 SEV-SNP Kernel Configuration

We used a **custom Linux kernel ≥ 6.11**, compiled manually to ensure SNP support:

| Setting                        | Purpose                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `CONFIG_KVM`, `CONFIG_KVM_AMD` | Enables AMD virtualization through KVM                             |
| `CONFIG_AMD_MEM_ENCRYPT`       | Provides memory encryption for SEV/SEV-ES/SEV-SNP                  |
| `CONFIG_CRYPTO_DEV_CCP`        | Loads AMD Secure Processor (PSP) crypto driver for SNP interaction |
| `CONFIG_SEV_GUEST`             | Enables guest-side kernel awareness of encrypted memory & SNP      |

> These were essential to support SEV-SNP memory encryption and page table validation features for the confidential VMs.

#### 🖥️ SEV-SNP QEMU Setup

QEMU was compiled from source. The [VM creation guide](https://github.com/ultravioletrs/cocos/tree/main/manager#test-vm-creation) shows how to launch confidential VMs.

### 🥥 Coconut SVSM and vTPM Provisioning in CocosAI for SEV-SNP

---

#### Why Hardware TPMs Fall Short in Confidential VMs

Traditional Trusted Platform Modules (TPMs) are widely used for measured boot, integrity reporting, and cryptographic key operations. However, in SEV-SNP-based confidential environments, hardware TPMs introduce several limitations:

- They can interfere with SNP boot and attestation flows.
- Physical TPMs are bound to specific hosts, making them unsuitable for cloud-native, multi-tenant environments.
- AMD guidance explicitly recommends disabling hardware TPMs in SEV-SNP guests and using vTPMs protected by the CVM’s trusted execution boundary instead.

To enable scalable attestation across dynamic infrastructure without relying on fixed hardware, CocosAI adopted a vTPM solution via Coconut SVSM.

#### Coconut SVSM: Trusted Services Inside the Guest

To address the need for scalable attestation without relying on static hardware, CocosAI adopted the Coconut Secure VM Service Module (SVSM) — a minimal, trusted runtime that delivers secure services from within the guest VM itself.

![Coconut SVSM architecture](/img/Coconutsvsm.png)

Unlike traditional models where sensitive services (like vTPMs) are provided by the host hypervisor, Coconut SVSM is:

- **Executed inside encrypted guest memory**, protected from the host.
- **Run at VMPL0** (on AMD SEV-SNP), with isolation from both the guest OS (VMPL1+) and the hypervisor.
- **Written in Rust**, ensuring memory safety and service minimalism.
- **Designed with least privilege in mind**, with user-mode (CPL3) services that operate with minimal address space exposure.

This architecture makes Coconut SVSM ideal for hosting **vTPMs**, as it ensures **root-of-trust isolation** even in hostile or multi-tenant environments.

#### Cocos AI vTPM Integration Details

To meet these needs — enabling attestation of container workloads across dynamic AMD hosts without relying on host TPMs — CocosAI uses coconutsvsm-vtpm, a user-space TPM service that runs inside Coconut SVSM. Key integration features include:

| **Feature**                  | **Description**                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Secure Provisioning**      | vTPM runs in SVSM’s **VMPL0 context**, ensuring full isolation from the host and guest OS.                                  |
| **Reference Implementation** | Based on the official **Microsoft TPM 2.0** reference code, adapted to run as a CPL3 service inside SVSM.                   |
| **Ephemeral State**          | Stateless between boots — a fresh **Endorsement Key (EK)** is created at startup, avoiding the need for persistent storage. |

---

> By integrating Coconut SVSM and its vTPM into the CocosAI, we ensured strong guest-bound cryptographic guarantees, scalable across cloud-native environments, with no trust in the host or hardware TPMs.

## Intel TDX

Intel Trust Domain Extensions (Intel TDX) is Intel’s Confidential Computing solution that protects data during execution by isolating virtual machines into hardware-enforced environments called Trust Domains (TDs). These TDs safeguard sensitive workloads against a wide range of software threats, including those from the host OS, hypervisor, and VMM. Unlike traditional security models that focus on data at rest or in transit, Intel TDX ensures that even data in use—residing in memory or moving across the data bus—remains encrypted and inaccessible to unauthorized entities. This hardware-enforced isolation reduces the Trusted Computing Base (TCB) to the CPU and Intel’s TDX module, enabling cloud tenants to untrust the infrastructure stack while maintaining strong security guarantees.

![Intel TDX Threat model](/img/TDXThreatModel.png)

Intel TDX uses hardware memory encryption and access control to isolate TD memory from the rest of the system. When the VMM allocates memory for a TD, the memory is tagged and encrypted using a dedicated ephemeral key unique to the TD. All memory accesses by TDs go through a hardware encryption engine that ensures confidentiality and integrity. Each TD’s memory is mapped with secure page tables that cannot be accessed or manipulated by the VMM or any other non-TD software. This guarantees that the contents of TD memory remain protected, even if the hypervisor or host OS is compromised.

![Intel TDX Threat model](/img/TDXMEMORY.png)

These protections are enforced by the Intel TDX Module, a trusted system component that manages the lifecycle of TDs. It operates inside a new CPU mode called Secure Arbitration Mode (SEAM), which provides an isolated environment with strict execution boundaries. SEAM ensures that only Intel-signed TDX Modules can be loaded and isolates the TDX logic from the rest of the system. The TDX Module collaborates with the VMM to create and manage TDs, but it maintains sole control over memory protection, TD entry/exit, and encryption key provisioning. It also resides in protected memory defined by the SEAM Range Register (SEAMRR) and is required for attestation, generating cryptographically signed TD reports. Platforms must enable SEAM Loader via BIOS to activate TDX support.

![Intel TDX Threat model](/img/SEAMCall.png)

These architectural foundations ensure that Intel TDX can uphold its strong security guarantees even in the presence of a compromised host, making it a cornerstone of confidential computing in modern cloud environments.

---

### 🔐 Intel TDX Security Guarantees

| **Security Property**                      | **Intel TDX Guarantee** | **How It’s Enforced**                                                                       |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------- |
| **Memory confidentiality**                 | ✅ Protected            | Memory encrypted using Intel TME-MK; data decrypted only inside the CPU                     |
| **Memory integrity**                       | ✅ Protected            | TD bit tracking and future SHA-3 MAC support for cryptographic integrity                    |
| **Isolation from host software**           | ✅ Enforced             | TDs are hardware-isolated from VMM, hypervisor, BIOS, and other host components             |
| **Reduced trust boundary**                 | ✅ Achieved             | Only TD guest OS/software and CPU are trusted; host stack is excluded                       |
| **Runtime data protection**                | ✅ Ensured              | Data remains encrypted while in use; visible in plaintext only inside the CPU               |
| **Unauthorized code execution prevention** | ✅ Enforced             | TDX Module protected by Secure Arbitration Mode (SEAM); only Intel-signed code can run      |
| **Secure VM lifecycle**                    | ✅ Enforced             | TDX Module manages TD creation, page assignment, and teardown securely                      |
| **Remote attestation**                     | ✅ Supported            | TD Quote generated via Intel SGX-based quoting enclave; proves TD integrity and TCB version |
| **TCB rollback prevention**                | ✅ Enforced             | TCB-level updates require re-attestation and re-registration                                |

---

### Intel TDX: System Requirements and Overview

Here are the setup procedures and required libraries/components for Intel TDX:

#### Intel Hardware Requirements

| **Component**      | **Requirement**                                                                    | **Role / Purpose**                                         |
| ------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Processor**      | 5th Gen Intel Xeon Scalable (Emerald Rapids), and Xeon 6 (E- and P-Cores)          | Supports Intel TDX hardware virtualization                 |
| **Memory (DIMMs)** | All slot 0s of all IMC channels populated symmetrically (≥ 8 DIMMs per CPU socket) | Required for proper memory encryption and system stability |
| **BIOS**           | Intel TDX-enabled BIOS from OEM/ODM or independent BIOS vendors                    | Enables TDX hardware features                              |

---

#### Intel Software Requirements

| **Component**                                       | **Requirement**                                                                                    | **Role / Purpose**                                      |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Operating System**                                | TDX Early Preview distros like Ubuntu 24.04/25.04, CentOS Stream 9, openSUSE Leap 15.5/SLES 15-SP5 | Provides kernel and userspace support for Intel TDX     |
| **Intel TDX Host Setup Script**                     | Clone and run from Intel's [canonical/tdx](https://github.com/canonical/tdx) repository            | Automates host configuration                            |
| **MSR Tools**                                       | `msr-tools` package and kernel module loaded                                                       | For verifying TDX enablement                            |
| **PCCS (Provisioning Certificate Caching Service)** | Installed and configured (`nodejs`, `cracklib-runtime` dependencies)                               | Collateral caching service for attestation certificates |
| **QGS (Quote Generation Service)**                  | Installed via packages like `tdx-qgs` and related libs                                             | Hosts TD Quoting Enclave for attestation                |
| **Attestation Registration Tools**                  | `sgx-ra-service`, `sgx-pck-id-retrieval-tool`, Python-based PCCS admin tools                       | Supports direct and indirect platform registration      |

---

## Intel TDX Host Kernel Setup in Cocos AI

In the Cocos AI project, the host system was configured to support Intel TDX for launching and attesting confidential workloads. Below is a detailed breakdown of the configuration process used on the host:

### 🔧 TDX Kernel Configuration

We used a custom Linux 6.8 kernel, compiled with Intel TDX support:

| Setting                   | Purpose                                                   |
| ------------------------- | --------------------------------------------------------- |
| `CONFIG_KVM`              | Enables Kernel-based Virtual Machine support              |
| `CONFIG_KVM_INTEL_TDX`    | Adds Intel TDX support in the KVM hypervisor              |
| `CONFIG_INTEL_TDX_MODULE` | Loads Intel TDX host kernel module                        |
| `CONFIG_INTEL_TME`        | Enables Total Memory Encryption (TME) for host memory     |
| `CONFIG_VSOCK`            | Enables Virtio sockets (vsock) for communication with TDs |

These kernel options enable TDX-specific memory encryption, VM management, and attestation capabilities.
More details about [host setup](https://github.com/canonical/tdx) are available in the canonical TDX repository.

### 🧬 TDX Firmware & BIOS Configuration

The host used Intel TDX-enabled firmware and BIOS with the following settings:

| Component     | Requirement                                            |
| ------------- | ------------------------------------------------------ |
| BIOS Version  | Intel TDX-enabled BIOS from OEM or BIOS vendor         |
| BIOS Settings | - Enable Memory Encryption (TME)                       |
|               | - Enable Total Memory Encryption Multi-Tenant (TME-MT) |
|               | - Enable Trust Domain Extension (TDX)                  |
|               | - Enable SEAM Loader                                   |
|               | - Set TME-MT/TDX key split to non-zero                 |
|               | - Enable Software Guard Extensions (SGX)               |

These settings allow the host to securely launch Trust Domains and enable remote attestation services.

### 🖥️ TDX QEMU Setup (Hypervisor)

QEMU was installed with Intel TDX support.
