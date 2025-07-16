# Public Cloud Attestation

## Introduction

Ensuring system integrity and security is critical in modern computing environments, especially with the rise of confidential computing. Remote attestation is a key component of this security model, allowing one party to verify the integrity of another system before sharing sensitive information. This document provides an overview of attestation in public cloud environments, specifically focusing on Microsoft Azure and Google Cloud Platform.

Cocos provides attestation capabilities for Confidential Virtual Machines (CVMs) running on Microsoft Azure and Google Cloud Platform. The attestation framework establishes cryptographic proof of system integrity through hardware-backed Trusted Execution Environments (TEE) and Virtual Trusted Platform Modules (vTPM).

## Trusted Computing Base (TCB)

![TCB](/img/attestation/public-cloud-tcb.svg)

### Definition and Scope

The Trusted Computing Base (TCB) represents the complete set of hardware, firmware, and software components that are critical to the security of a computing system. The TCB establishes the root of trust from which all security properties of the system are derived. In the context of confidential computing and cloud attestation, the TCB includes multiple layers that must be verified to ensure system integrity.

### TCB Components Hierarchy

The TCB forms a hierarchical chain of trust, where each layer depends on the integrity of the layers below it:

#### 1. Hardware Root of Trust (Layer 0)

The foundational layer of the TCB, consisting of:

**AMD SEV-SNP Processor:**

- Secure Encrypted Virtualization with Secure Nested Paging
- Hardware-enforced memory encryption and isolation
- Platform Security Processor (PSP) for secure operations
- Cryptographic identity keys burned into silicon

**Hardware Security Module (HSM):**

- Dedicated cryptographic processing unit
- Tamper-resistant hardware for key storage
- Hardware-based random number generation
- Secure key derivation and attestation signing

**CPU Microcode and Firmware:**

- Low-level processor instructions and behavior
- Security patches and vulnerability mitigations
- Platform-specific security features
- Hardware feature enablement and configuration

#### 2. Firmware Layer - Static Root of Trust for Measurement (SRTM)

The firmware layer serves as the SRTM, responsible for:

**UEFI/OVMF Firmware:**

- Unified Extensible Firmware Interface implementation
- Open Virtual Machine Firmware for virtualized environments
- Platform initialization and hardware discovery
- Secure boot chain establishment

**Secure Boot Chain:**

- Cryptographic verification of boot components
- Certificate chain validation
- Signature verification of boot loaders and OS kernels
- Prevention of unauthorized code execution

**PCR 0-7 Measurements:**

- Core Root of Trust for Measurement (CRTM)
- UEFI firmware measurements
- Boot configuration and variables
- Platform configuration and setup

#### 3. Virtualization Layer

**Virtual TPM (vTPM):**

- Software-based TPM functionality
- PCR extend operations for boot measurements
- Attestation Key (AK) generation and management
- Secure storage of cryptographic artifacts

**SEV-SNP Attestation:**

- Guest memory measurement and validation
- Platform configuration measurements
- Security version number tracking
- Launch measurement verification

#### 4. Operating System Layer

##### Linux Integrity Measurement Architecture (IMA)

- File system integrity measurements (PCR 10)
- Runtime file access monitoring
- Executable and library verification
- Configuration file integrity

##### Kernel and Initramfs Integrity

- Kernel image measurement and verification
- Initial RAM filesystem validation
- Kernel module loading verification
- System call table integrity

##### Event Log Maintenance

- TPM event log handover from UEFI firmware
- Continuous event log extension during runtime
- Event log integrity and tamper detection
- Integration with measurement subsystems

### TCB Verification Models

#### Direct Verification Model (GCP)

Google Cloud Platform implements a direct verification approach where:

- **Golden Measurements:** Reference values stored in GCP's TCB Integrity Bucket
- **Independent Verification:** Clients can verify measurements without relying on centralized services
- **Launch Endorsements:** Cryptographically signed endorsements for valid configurations
- **Policy Enforcement:** Client-side policy validation against known good states

**Verification Process:**

1. Retrieve golden measurements from `gce_tcb_integrity` bucket
2. Compare attestation evidence against reference values
3. Validate launch endorsements and signatures
4. Enforce custom policies based on measurement comparison

#### Centralized Verification Model (Azure)

Microsoft Azure uses a centralized attestation service approach:

- **Microsoft Azure Attestation (MAA):** Centralized verification service
- **Signed JWT Tokens:** Attestation results in standardized token format
- **Trust Service Provider:** Azure acts as the trusted third party
- **Simplified Client Logic:** Reduced complexity for attestation consumers

**Verification Process:**

1. Submit attestation evidence to MAA service
2. MAA validates against Azure's known configurations
3. Receive signed JWT token with security claims
4. Validate token signature using MAA public keys

### TCB Security Properties

- **Immutability**

  - PCR values cannot be directly overwritten, only extended
  - Firmware measurements are cryptographically bound to hardware
  - Boot sequence modifications are detectable through PCR changes

- **Authenticity**

  - Hardware-rooted cryptographic signatures
  - Certificate chains anchored in hardware identity
  - Tamper-evident measurement logs

- **Freshness**

  - Nonce-based replay attack prevention
  - Timestamp validation in attestation reports
  - Event sequence verification

- **Completeness**

  - Comprehensive measurement of all TCB components
  - Coverage of both static and dynamic system elements
  - Verification of configuration and runtime state

## Attestation Architecture Overview

### Attestation Components

The Cocos attestation system consists of two primary attestation sources:

#### TEE Attestation (SEV-SNP)

Hardware-generated attestation reports from AMD SEV-SNP processors containing:

- **Platform measurements:** Cryptographic hashes of platform state
- **Security version numbers:** TCB component version tracking
- **Policy validation:** Hardware-enforced security policies
- **Guest isolation proof:** Cryptographic evidence of memory protection

The SEV-SNP attestation report is a binary structure containing fields such as:

- Version, Guest SVN, Policy
- Family ID, Image ID, Measurement (hash of initial guest memory)
- Host data, ID block data, Author key digest
- Signature and certificate chain

#### vTPM Attestation

Virtual Trusted Platform Module quotes containing:

- **Boot measurements:** PCR values from the boot sequence
- **Software component integrity:** Hash measurements of loaded components
- **Configuration state:** System configuration and policy settings
- **Event logs:** Detailed record of all measured events

### Verification Flow

```text
CVM Instance → Generate Attestation → Platform Service → Verify Claims → Policy Enforcement
```

Both platforms follow this flow but implement different verification mechanisms and trust models.

## Platform-Specific Implementations

### Microsoft Azure Implementation

#### Azure Attestation Service Integration

Azure uses the Microsoft Azure Attestation (MAA) service as a centralized attestation verifier. The MAA service validates attestation reports and issues signed JWT tokens containing security claims.

#### Azure Attestation Process

1. **Evidence Generation:**

   - The CVM generates a combined SEV-SNP attestation report and a vTPM quote
   - The SEV-SNP report is obtained by interacting with the underlying hardware and kept inside vTPM Non-Nolatile (NV) memory
   - The vTPM quote is fetched from the virtual TPM

2. **Service Submission:**

   - Combined report parameters are generated for the MAA service
   - The report is submitted to a MAA service endpoint (e.g., `sharedeus2.eus2.attest.azure.net`)
   - MAA validates the report against Azure's known configurations

3. **Token Verification:**

   - MAA returns a signed JWT token containing security claims
   - Token validation involves retrieving the MAA public key set
   - Signature verification ensures token authenticity and integrity

#### Azure Token Claims Structure

The MAA token contains security-relevant claims within the `x-ms-isolation-tee` namespace:

**Hardware Identity Claims:**

- `x-ms-sevsnpvm-familyId`: Processor family cryptographic identifier
- `x-ms-sevsnpvm-imageId`: VM image configuration identifier  
- `x-ms-sevsnpvm-launchmeasurement`: Initial guest state cryptographic hash

**Security Version Claims:**

- `x-ms-sevsnpvm-bootloader-svn`: Boot loader security version
- `x-ms-sevsnpvm-tee-svn`: TEE security version
- `x-ms-sevsnpvm-snpfw-svn`: SNP firmware security version
- `x-ms-sevsnpvm-microcode-svn`: Microcode security version

**Runtime Security Claims:**

- `x-ms-sevsnpvm-guestsvn`: Guest OS security version number
- `x-ms-sevsnpvm-idkeydigest`: Identity key cryptographic hash
- `x-ms-sevsnpvm-reportid`: Attestation report unique identifier

### Google Cloud Platform Implementation

#### GCP Direct Verification Model

GCP provides direct access to golden measurements and launch endorsements, enabling independent verification without relying on a centralized attestation service.

#### GCP Attestation Process

1. **Evidence Generation:**

   - The CVM generates a SEV-SNP attestation report and a vTPM quote
   - Both `teeNonce` and `vTpmNonce` are provided to ensure freshness
   - vTPM quote is fetched by opening a connection to the TPM device (`/dev/tpmrm0` or `/dev/tpm0`)
   - TPM attestation key is used to retrieve the quote, including PCR values and event log
   - The SEV-SNP report is fetched directly from the guest environment

2. **Event Log Processing:**

   - Event log is read from `/sys/kernel/security/tpm0/binary_bios_measurements`
   - Combined attestation is marshaled for transmission

3. **Verification Process:**

   - vTPM quote's signature is verified using the Attestation Key (AK) public key
   - PCR values within the quote are checked against expected golden values
   - Event log is replayed to ensure consistency with PCR values
   - SEV-SNP attestation report is verified against policy parameters

#### GCP Storage Integration

GCP utilizes a TCB Integrity Bucket (`gce_tcb_integrity`) for storing:

**Launch Endorsements:**

- Path: `ovmf_x64_csm/sevsnp/{measurement}.binarypb`
- Contains golden measurements for different vCPU configurations
- Includes SEV-SNP policy values and UEFI measurement data
- Serialized as protocol buffer format for structured access

**OVMF Files:**

- Path: `ovmf_x64_csm/{digest}.fd`
- Firmware binary images for verification
- Cryptographic hashes for integrity validation

## Security Considerations

### Threat Model

The attestation system is designed to protect against:

#### Malicious Hypervisor

- Memory access and modification attempts
- VM state manipulation
- Firmware replacement or modification
- Boot sequence tampering

#### Compromised Guest OS

- Kernel modification and rootkits
- System call interception
- File system tampering
- Configuration manipulation

#### Supply Chain Attacks

- Firmware backdoors
- Compromised boot components
- Malicious kernel modules
- Signed but malicious software

#### Replay Attacks

- Stale attestation evidence
- Cached measurement reuse
- Time-of-check vs time-of-use vulnerabilities

### Security Properties

#### Confidentiality

- Memory encryption prevents unauthorized access
- Key derivation tied to platform state
- Sealed storage protects sensitive data

#### Integrity

- Cryptographic measurement of all components
- Tamper-evident logging
- Hardware-rooted trust anchor

#### Authenticity

- Hardware-based signatures
- Certificate chain validation
- Platform identity verification

#### Freshness

- Nonce-based replay protection
- Timestamp validation
- Monotonic counter usage

### Best Practices

#### Policy Design

- Define minimum acceptable TCB versions
- Specify required measurement values
- Implement graduated trust levels
- Regular policy updates and reviews

#### Key Management

- Secure key generation and storage
- Regular key rotation procedures
- Hardware-backed key protection
- Proper key lifecycle management

#### Monitoring and Alerting

- Continuous attestation monitoring
- Anomaly detection and response
- Security event logging
- Incident response procedures

### Error Handling and Debugging

#### Common Verification Failures

- **PCR Mismatch:** Boot configuration changes or updates
- **Signature Verification:** Certificate chain issues or key rotation
- **Version Downgrade:** Older firmware or microcode versions
- **Policy Violation:** Configuration outside acceptable parameters

#### Debugging Strategies

- **Verbose Logging:** Enable detailed measurement and verification logs [CLI docs (-v flag)](./cli.md)
- **Incremental Verification:** Test individual components separately
- **Reference Comparison:** Compare against known working configurations
- **Timeline Analysis:** Examine boot sequence and timing

### Performance Considerations

#### Attestation Overhead

- **Report Generation:** depends on the platform
- **Network Transmission:** Varies by report size and network conditions
- **Verification Processing:** Varies depending on amount of verified values

This comprehensive guide provides the foundation for implementing robust attestation systems in public cloud environments, ensuring the security and integrity of confidential computing workloads.
