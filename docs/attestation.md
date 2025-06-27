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

For the relying party to send confidential data or code to the Agent, a secure channel must be established between them. The secure channel is established using attested TLS, which is a TLS connection enriched with the attestation report of the Agent. 

In Cocos, the CVM acts as the server, and the Agent extends the x.509 certificate it uses for TLS with the attestation report. When generating the report, the Agent embeds the hash of its public key into the `report_data` field of the AMD SEV-SNP report and the PCR15 register of the vTPM.
The whole process can be seen in the below picture. The green color represents the trusted part of the system, while the red is untrusted.

![Attested TLS](/img/atls.png)

Cocos uses two TLS extensions to send the attestation report to the relying party. OpenSSL is used to implement these two extensions:
 1. The Evidence Request extension. The client sends this extension to the server. The extension contains two random nonces that will be used to provide freshness to the attestation report (vTPM and SEV-SNP).
 2. The Attestation certificate extension. This extension is sent from the server to the client and contains the attestation report that the client will verify.

One of the key components of the verification process is the attestation policy. The CLI uses the attestation policy to verify the fields of the attestation report (vTPM and SEV-SNP). One example of the attestation report is show below:

```json
{
  "pcr_values": {
    "sha256": {
      "0": "71e0cc99e4609fdbc44698cceeda9e5ecb2f74fe07bd10710d5330e0eb6bd32b",
      "1": "a40e22460c21d2450367ca70c751ec0ae5ae1072994a131287a96eadc295603b",
      "2": "3d458cfe55cc03ea1f443f1562beec8df51c75e14a9fcf9a7234a13f198e7969",
      "3": "3d458cfe55cc03ea1f443f1562beec8df51c75e14a9fcf9a7234a13f198e7969",
      "4": "e16812b9181e13078b29f2e4844be7087f9e1bbffc3cb4171d2813580cafdb8d",
      "5": "a5ceb755d043f32431d63e39f5161464620a3437280494b5850dc1b47cc074e0",
      "6": "3d458cfe55cc03ea1f443f1562beec8df51c75e14a9fcf9a7234a13f198e7969",
      "7": "70d12f32fdb109ba0960697b5a8d5d8d860b004a757fe2471be2c2a19ec1a765",
      "9": "2add30b0f2b31480ee5eb802c436cfffe77ceebc6009e063e84fc6a6ef2c05ac"
    },
    "sha384": {
      "0": "ff93a763afde2c4a152d4843d9fcabe73a70d4f34bf8861845f2ab08440c1f0742b5882ed7f2524e38a3a6e40fbcdfca",
      "1": "c9b3bcc22d856cbc5be2a2bf72d81819df325db083cfea20e84d082a87f44d643e6fca98f29eb3cce4c87eed2dbca2e5",
      "2": "518923b0f955d08da077c96aaba522b9decede61c599cea6c41889cfbea4ae4d50529d96fe4d1afdafb65e7f95bf23c4",
      "3": "518923b0f955d08da077c96aaba522b9decede61c599cea6c41889cfbea4ae4d50529d96fe4d1afdafb65e7f95bf23c4",
      "4": "d18d213c26e7bc309e52448bde2f0a8ef86be388223f64f85c4e0c625f1e0a7f8c901d4f7c98f8445730bc63c4dfa88d",
      "5": "c50b529497c7f441ea47305587d6ce83e2e31f7b4fab6c13dc0b0c3c900e1d0caf0768321100927862df142bf0465ee4",
      "6": "518923b0f955d08da077c96aaba522b9decede61c599cea6c41889cfbea4ae4d50529d96fe4d1afdafb65e7f95bf23c4",
      "7": "ea40cbd8f51eed103d75821340e71fa3c0cfde3e75c360b4c9aca534b7fed021e12f8890acef36ccfe12b33ea4111576",
      "9": "02556c6b494abaf21481def35b38574e80dc68f20ceb8385f78a5ad4ecfbab60f9fcfca7c69f09a081fdd4ca13f3c14d"
    }
  },
  "policy": {
    "chip_id": "GrFqtQ+lrkLsjBslu9pcC6XqkrtFWY1ArIQ+I4gugQIsvCG0qekSvEtE4P/SLSJ6mHNpOkY0MHnGpvz1OkV+kw==",
    "family_id": "AAAAAAAAAAAAAAAAAAAAAA==",
    "host_data": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    "image_id": "AAAAAAAAAAAAAAAAAAAAAA==",
    "measurement": "oDYo4e98Da2Fy73nDVZmxiWiz+5gnxae7NMRtdfnwpbBuVYZsI0mynz3fpfe+YIX",
    "minimum_build": 8,
    "minimum_launch_tcb": 15352208179752599555,
    "minimum_tcb": 15352208179752599555,
    "minimum_version": "1.55",
    "permit_provisional_firmware": true,
    "policy": 196608,
    "product": {
      "name": 1
    },
    "report_id_ma": "//////////////////////////////////////////8=",
    "require_author_key": false,
    "require_id_block": false,
    "vmpl": 2
  },
  "root_of_trust": {
    "check_crl": true,
    "disallow_network": false,
    "product": "Milan",
    "product_line": "Milan"
  }
}
```

The array `pcr_values` represents the expected (golden) PCR values that must match the PCR values in the vTPM attestation report. The `policy` part describes the reference values for the fields of the SEV-SNP attestation report.