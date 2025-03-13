# Attestation   

## Introduction  
Ensuring system integrity and security is critical in modern computing environments. Confidential computing protects sensitive data during processing, ensuring it remains encrypted and secure. A key component of this security model is remote attestation, which allows one party to verify the integrity of another system before sharing sensitive information.  

The Trusted Platform Module (TPM) plays a fundamental role in this process by providing a tamper-resistant foundation for cryptographic operations, securing sensitive artifacts, measuring system state, and enabling attestation mechanisms.  

This document provides an overview of attestation, TPM, Platform Configuration Registers (PCRs), and runtime measurements, explaining how they work together to ensure a trusted computing environment.  

## Attestation  

Remote attestation is a process in which one system (the attester) gathers information about itself and sends it to a relying party (or client) for verification. Successful verification ensures that the Confidential Virtual Machine (CVM) is running the expected code on trusted hardware with the correct configuration. If deemed trustworthy, the relying party can securely send confidential code or data to the attester.  

A secure communication channel is required between the attester and the relying party, which is established using attested TLS.  

### Attestation in Cocos  
Cocos implements attestation using two key software components:  

1. **Agent** – A software application running inside the CVM. It is responsible for fetching the attestation report, performing vTPM-based attestation, and executing secure computations.  
2. **Cocos CLI** – A command-line tool used by Secure Multiparty Computation (SMPC) members. It verifies the attestation report and securely transmits confidential code and data to the Agent.  

## Trusted Platform Module (TPM)  
A TPM is a dedicated security chip designed to perform tamper-resistant cryptographic functions. It securely manages sensitive artifacts such as encryption keys, certificates, and integrity measurements. In scenarios where TPM functionality is implemented via software instead of hardware, it is referred to as a virtual TPM (vTPM).  

## Platform Configuration Register (PCR)  
A Platform Configuration Register (PCR) is a secure memory region within the TPM that records system integrity measurements. Instead of being overwritten, PCR values are extended through a cryptographic hash function: 

$$
PCR[N] = \text{HASH}_{\text{alg}}( PCR[N] \, || \, \text{NewMeasurement} )
$$

This ensures that all recorded values remain linked and verifiable, making PCRs essential for attestation and system security.  

# Trusted Boot and Integrity Measurement

## Introduction

System integrity is ensured by measuring and recording each boot component into the Trusted Platform Module (TPM). The firmware acts as the **Static Root of Trust for Measurement (SRTM)**, measuring critical components and storing their hashes in the TPM's Platform Configuration Registers (PCRs). These values are extended immutably, creating a tamper-proof record. 
A typical TPM has 24 PCRs. PCRs [0-15] represent the SRTM and are associated with Locality 0. PCRs [0-7] are used for platform firmware and PCRs [8-15] are used for the operating system. PCR [16] is for debug usage. PCR [23] is for application support. PCRs [17-22] represent the platform's dynamic root of trust for measurement (DRTM). In this document we will focus on the usage of PCRs [0-7], as described in the following table.

This process enables secure attestation, ensuring that only verified software executes and detecting unauthorized modifications. The TPM also functions as a **Root of Trust for Storage (RTS)** and **Root of Trust for Reporting (RTR)**, allowing for remote verification of system integrity.

## What We Verify in Each PCR

| **PCR Index** | **What is Stored?** | **What We Verify?** | **Why It Is Important for Integrity?** |
|--------------|---------------------|---------------------|--------------------------------------|
| **PCR[0]** | BIOS/firmware, embedded option ROMs, and platform initialization (PI) drivers. | Ensures the BIOS and firmware have not been tampered with. | Prevents unauthorized firmware modifications that could compromise the boot process. |
| **PCR[1]** | Hardware configuration settings. | Ensures critical hardware settings remain unchanged. | Prevents attackers from modifying security-critical hardware configurations. |
| **PCR[2]** | Hashes of UEFI drivers and pre-boot applications. | Verifies that UEFI drivers loaded into memory are from a trusted source. | Prevents firmware-level attacks such as rootkits. |
| **PCR[3]** | Configuration settings for UEFI drivers. | Ensures no unauthorized modifications to UEFI driver settings. | Prevents malicious driver configuration changes that could alter system behavior. |
| **PCR[4]** | Boot manager and bootloader code. | Verifies the correct bootloader is executed. | Prevents bootloader hijacking, ensuring a trusted boot process. |
| **PCR[5]** | Boot configuration and partition information. | Ensures the partition layout and boot configurations are unchanged. | Prevents unauthorized modifications to the disk that could enable persistence of malware. |
| **PCR[6]** | Manufacturer-specific data. | Verifies vendor-defined integrity checks are satisfied. | Ensures additional security policies and firmware checks are enforced. |
| **PCR[7]** | Secure Boot policies, certificates, and signing keys. | Verifies that only signed and authorized components are loaded during boot. | Prevents the execution of unsigned or malicious software. |
| **PCR[8]**  | Boot components related to third-party applications. | Ensures third-party applications loaded at boot are unmodified. | Prevents unauthorized software from executing in the early boot stage. |
| **PCR[9]**  | Secure Boot variables and policies. | Confirms Secure Boot settings are enforced correctly. | Ensures only trusted, signed software is executed during boot. |
| **PCR[10]** | Reserved for OS-specific uses. | OS-specific verification (depends on platform and implementation). | Used for OS-level security policies and attestation. |
| **PCR[11]** | Trusted platform data used by virtualization or hypervisors. | Ensures virtualized environments load expected security policies. | Prevents tampering with virtualized workloads and hypervisors. |
| **PCR[12]** | Reserved for dynamic launch measurement (measured by DRTM). | Verifies system state after a dynamic launch event. | Ensures platform security is intact even after runtime modifications. |
| **PCR[13]** | Application-specific measurements. | Ensures certain applications are trusted and unchanged. | Allows attestation of user-defined or platform-specific applications. |
| **PCR[14]** | Reserved for future use by TCG standards. | Typically unused or reserved for future expansion. | Reserved for security enhancements in newer TPM specifications. |
| **PCR[15]** | Reserved for future use by TCG standards. | Same as PCR[14]. | Future security mechanisms may utilize this. |
| **PCR[16]** | Debugging and manufacturer-specific measurements. | Verifies if debugging tools are active. | Helps detect unauthorized debugging or forensic analysis. |
| **PCR[17]** | TPM firmware and microcode updates. | Ensures TPM firmware has not been downgraded or tampered with. | Protects against rollback attacks on the TPM firmware. |
| **PCR[18]** | System integrity logs and extended boot metrics. | Verifies integrity logs from boot measurements. | Helps forensic analysis and runtime integrity checks. |
| **PCR[19]** | Kernel and OS runtime measurements. | Ensures kernel integrity at runtime. | Prevents kernel tampering and runtime exploits. |
| **PCR[20]** | Kernel modules and drivers. | Verifies that only authorized kernel modules are loaded. | Protects against kernel-level rootkits and unauthorized drivers. |
| **PCR[21]** | Measured launch environment (MLE) for secure workloads. | Verifies integrity of measured environments like SGX or CVMs. | Ensures trusted execution of confidential workloads. |
| **PCR[22]** | Hypervisor integrity measurements. | Ensures hypervisor has not been modified post-boot. | Prevents attacks targeting virtual machine isolation. |
| **PCR[23]** | Platform-specific attestation data. | Used for custom attestation purposes. | Provides additional flexibility for specific security policies. |

 
PCRs **8-23** focus on **OS, application, and virtualization security**, extending integrity measurements beyond the firmware and bootloader. These values play a key role in **trusted execution environments**, **secure workloads**, and **virtualization security**—ensuring **Confidential Virtual Machines (CVMs)** operate on trusted hardware with verified software components.



By leveraging PCR measurements, systems maintain **trusted execution environments**, ensuring the integrity of Confidential Virtual Machines (CVMs) and other secure workloads.


## Runtime Measurement  
A runtime measurement is a cryptographic fingerprint that captures the state of critical system components during execution. These measurements are typically applied to the bootloader and operating system kernel, enabling detection of unauthorized changes and ensuring the system’s integrity.  

By integrating TPM, PCRs, and runtime measurements, attestation mechanisms can ensure that a Confidential Virtual Machine (CVM) is running in a trusted environment, protecting sensitive computations from unauthorized access or tampering.  

 ## What are the parts of the attestation report?

The attestation report consists of multiple components that provide cryptographic proof of the CVM’s integrity and security posture.  
 
1. **Measurement** – Represents the cryptographic hash of the entire CVM or the hash of the [HAL](./hal.md). This enables the client to verify the contents of the CVM.  
2. **Boot and Hardware Information** – Contains details about the CVM’s boot policy and the SNP firmware’s Trusted Computing Base (TCB) version, ensuring the system is running with the correct security configuration.  
3. **vTPM-Based Attestation Data** – Provides cryptographic evidence of the enclave's boot and runtime state. The CLient ensures IGVM validation by computing the expected launch measurement of the IGVM file and verifying that it aligns with the attestation report, preventing unauthorized modifications.  
4. **Report Data** – A 512-bit field that can contain arbitrary data provided by the Agent to the ASP each time the attestation report is generated.  
5. **Signature** – The AMD SEV-SNP attestation report is signed using the Versioned Chip Endorsement Key (VCEK). The VCEK is derived from chip-unique secrets and the current SNP firmware TCB. The signature is verified using the certificate from the AMD Key Distribution System (KDS), ensuring that the CVM runs on genuine AMD hardware and that the AMD Secure Processor (ASP) generated the attestation report.  


## How is the attestation report fetched?

The Agent is responsible for fetching the attestation report from the CVM. This procedure is safe because the Kernel and the ASP can exchange encrypted messages that can only be decrypted by the Kernel and the ASP. The keys used for the encryption/decryption are inserted by the ASP into the memory of the CVM during boot, thus ensuring that only the ASP and the CVM have the keys for safe communication.

Additionally, the Agent interacts with the vTPM inside the CVM using go-tpm-tools to retrieve attestation data, which includes cryptographic measurements of the enclave’s boot and runtime state. These measurements are used to generate the attestation report, which the Manager or an external verifier can validate to ensure the enclave’s integrity.

## Attested TLS

For the relying party to send confidential data or code to the Agent, a secure channel must be established between them. This is done using attested TLS, which is a TLS connection where the server's certificate is extended with the attestation report. The CVM is the server in Cocos. The Agent generates a self-signed x.509 certificate extended with the attestation report. When fetching the attestation report, the Agent inserts the hash of the public key into it using the field report data. The whole process can be seen in the below picture. The green color represents the trusted part of the system, while the red is untrusted.

![Attested TLS](/img/atls.png)

The relying party uses the Cocos CLI to verify the self-signed certificate and the attestation report that is part of it. Successful verification proves to the relying party that the certificate is generated inside the SVM because the certificate's public key is part of the attestation report.
