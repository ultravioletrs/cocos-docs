# Attestation

Ensuring system integrity and security is critical in modern computing environments. Confidential computing protects sensitive data during processing, ensuring it remains encrypted and secure. A key component of this security model is remote attestation, which allows one party to verify the integrity of another system before sharing sensitive information.  

The Trusted Platform Module (TPM) plays a fundamental role in this process by providing a tamper-resistant foundation for cryptographic operations, securing sensitive artifacts, measuring system state, and enabling attestation mechanisms.  

This document provides an overview of remote attestation, TPM, Platform Configuration Registers (PCRs), and runtime measurements, explaining how they work together to ensure a trusted computing environment.  

## Remote Attestation  

Attestation is a process in which one system (the attester) gathers information about itself and sends it to a relying party (or client) for verification. Successful verification ensures that the Confidential Virtual Machine (CVM) is running the expected code on trusted hardware with the correct configuration. If deemed trustworthy, the relying party can securely send confidential code or data to the attester.

Remote attestation verifies the integrity of a client platform by retrieving a quote from the TPM, which includes signed Platform Configuration Register (PCR) values. This process involves Event Log Verification, which ensures that recorded system events align with the expected platform state.  

### Event Log Verification

This ensures the platform’s integrity by checking if the recorded events match the expected state.  

1. The CLI requests a quote from the client.  
2. The Agent asks the TPM to sign the current PCR values using the AK private key and sends the signed quote to the CLI.  
3. The CLI verifies the quote’s signature using the AK public key, ensuring the PCR values are legitimate.    
4. The CLI replays the event log to reconstruct the PCR values. If the recalculated values match the received PCRs, the event log is verified.
5. The verified PCR values are then compared against predefined golden(good) values for the TPM. If they match the expected values in the vTPM quote, the platform's integrity is confirmed.

A secure communication channel is required between the attester and the relying party, which is established using attested TLS.

## Attestation in Cocos

Cocos implements remote attestation using two key software components:  

1. **Agent** – A software application running inside the CVM. It is responsible for fetching the attestation report, performing vTPM-based attestation, and executing secure computations.  
2. **Cocos CLI** – A command-line tool used by Secure Multiparty Computation (SMPC) members. It verifies the attestation report and securely transmits confidential code and data to the Agent.  

### Trusted Platform Module (TPM)

A TPM is a dedicated security chip designed to perform tamper-resistant cryptographic functions. It securely manages sensitive artifacts such as encryption keys, certificates, and integrity measurements. In scenarios where TPM functionality is implemented via software instead of hardware, it is referred to as a virtual TPM (vTPM).

### Platform Configuration Register (PCR)

A Platform Configuration Register (PCR) is a secure memory region within the TPM that records system integrity measurements. Instead of being overwritten, PCR values are extended through a cryptographic hash function:

$$
PCR[N] = \text{HASH}_{\text{alg}}( PCR[N] \, || \, \text{NewMeasurement} )
$$

This ensures that all recorded values remain linked and verifiable, making PCRs essential for attestation and system security.  

### Trusted Boot and Integrity Measurement

System integrity is ensured by measuring and recording each boot component into the Trusted Platform Module (TPM). The firmware acts as the **Static Root of Trust for Measurement (SRTM)**, measuring critical components and storing their hashes in the TPM's Platform Configuration Registers (PCRs). These values are extended immutably, creating a tamper-proof record.
A typical TPM has 24 PCRs. PCRs [0-7] are used for platform firmware and PCRs [8-15] are used for the operating system. PCR [16] is for debug usage. PCR [23] is for application support. PCRs [17-22] represent the platform's dynamic root of trust for measurement (DRTM). In this document we will focus on the usage of PCRs [0-7], as described in the following table.

This process enables secure attestation, ensuring that only verified software executes and detecting unauthorized modifications. The TPM also functions as a **Root of Trust for Storage (RTS)** and **Root of Trust for Reporting (RTR)**, allowing for remote verification of system integrity.

## What We Verify in Each PCR

A typical TPM has 24 PCRs. PCRs [0-15] represent the SRTM and are associated with Locality 0. PCRs [0-7] are used for platform firmware and PCRs [8-15] are used for the operating system. PCR [16] is for debug usage. PCR [23] is for application support. PCRs [17-22] represent the platform's dynamic root of trust for measurement (DRTM). Based on our measurements on our server, we only have PCR registers 0 to7 and PCR 9 in the vTPM quote.

| PCR Index    | What is Stored?                                                                               | What We Verify?                                           | Why It Is Important for Integrity?                                      |
|-------------|----------------------------------------------------------------------------------------------|----------------------------------------------------------|-----------------------------------------------------------------------|
| PCR[0]      | Firmware, including BIOS, embedded option ROMs, and platform initialization (PI) drivers.    | Ensures the BIOS and firmware have not been tampered with. | Prevents unauthorized firmware modifications that could compromise the boot process. |
| PCR[1]      | Boot order and boot variables.                                                               | Ensures critical boot settings remain unchanged.         | Prevents attackers from modifying boot parameters that could affect system startup. |
| PCR[2]      | /                                                                                            | /                                                        | / |
| PCR[3]      | /                                                                                            | /                                                        | / |
| PCR[4]      | Kernel                                                                                       | Verifies that the correct kernel is loaded.              | Prevents kernel-level attacks and ensures a trusted execution environment. |
| PCR[5]      | Finish boot service.                                                                         | Ensures boot services complete without unauthorized changes. | Prevents tampering with boot processes that could enable persistent threats. |
| PCR[6]      | (OEM-specific data; not applicable)                                                        | /                                                        | / |
| PCR[7]      | Secure Boot policies, certificates, and signing keys.                                        | Verifies that only signed and authorized components are loaded during boot. | Prevents the execution of unsigned or malicious software. |
| PCR[9]      | initramfs                                                                                    | Ensures the integrity of the initial RAM filesystem.      | Prevents unauthorized modifications that could impact early user-space execution. |
| PCR[15]     | Public TLS key used for attested TLS.                                                        | Verifies the integrity of the TLS public key used for attestation. | Ensures secure, authenticated communication and prevents unauthorized key modifications. |


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
