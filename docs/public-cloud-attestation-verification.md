# Public Cloud

## Overview

Cocos provides attestation verification capabilities for Confidential Virtual Machines (CVMs) running on Microsoft Azure and Google Cloud Platform. The attestation framework establishes cryptographic proof of system integrity through hardware-backed Trusted Execution Environments (TEE) and Virtual Trusted Platform Modules (vTPM).

## Architecture

### Attestation Components

The Cocos attestation system consists of two primary attestation sources:

**TEE Attestation (SEV-SNP):**

- Hardware-generated attestation reports from AMD SEV-SNP processors
- Contains platform measurements, security version numbers, and policy validation
- Provides cryptographic proof of hardware integrity and guest isolation

**vTPM Attestation:**

- Virtual Trusted Platform Module quotes containing boot measurements
- PCR (Platform Configuration Register) values from the boot sequence
- Software component integrity measurements and configuration state

### Verification Flow

```mermaid
CVM Instance → Generate Attestation → Platform Service → Verify Claims → Policy Enforcement
```

Both platforms follow this flow but implement different verification mechanisms and trust models.

## Microsoft Azure Implementation

### Azure Attestation Service Integration

Azure uses the Microsoft Azure Attestation (MAA) service as a centralized attestation verifier. The MAA service validates attestation reports and issues signed JWT tokens containing security claims.

**Attestation Process:**

1. CVM generates combined SEV-SNP and vTPM attestation report
2. Report is submitted to MAA service endpoint (example: `sharedeus2.eus2.attest.azure.net`)
3. MAA validates report against Azure's known configurations
4. Service returns signed JWT token with security claims

### Azure Token Claims Structure

The MAA token contains security-relevant claims within the `x-ms-isolation-tee` namespace:

**Hardware Identity Claims:**

- `x-ms-sevsnpvm-familyId`: Processor family cryptographic identifier
- `x-ms-sevsnpvm-imageId`: VM image configuration identifier
- `x-ms-sevsnpvm-launchmeasurement`: Initial guest state cryptographic hash

**Security Version Claims:**

- `x-ms-sevsnpvm-bootloader-svn`: Bootloader security version number
- `x-ms-sevsnpvm-tee-svn`: TEE security version number
- `x-ms-sevsnpvm-snpfw-svn`: SEV-SNP firmware security version number
- `x-ms-sevsnpvm-microcode-svn`: Processor microcode security version number

**Runtime Security Claims:**

- `x-ms-sevsnpvm-guestsvn`: Guest OS security version number
- `x-ms-sevsnpvm-idkeydigest`: Identity key cryptographic hash
- `x-ms-sevsnpvm-reportid`: Attestation report unique identifier

### Azure Policy Generation

Attestation policies are dynamically generated from validated MAA token claims:

**Policy Components:**

- **Image Identity**: Validates VM image through `imageId` and `familyId` claims
- **Launch Measurement**: Verifies initial guest state through `launchmeasurement` claim
- **Security Versions**: Enforces minimum security versions for all components
- **Key Validation**: Validates identity key through `idkeydigest` claim
- **Report Correlation**: Ensures report uniqueness through `reportid` claim
- **TCB Composition**: Validates Trusted Computing Base from security version claims

**Policy Structure:**

```yaml
Config:
  RootOfTrust:
    CheckCrl: true
  Policy:
    ImageId: [extracted from token]
    FamilyId: [extracted from token]
    Measurement: [extracted from token]
    MinimumGuestSvn: [extracted from token]
    TrustedIdKeyHashes: [extracted from token]
    ReportId: [extracted from token]
    Product: [determined from product parameter]
    Policy: [policy bitmask parameter]
```

**Sample Attestation Policy:**

```json
{
  "root_of_trust": {
    "check_crl": true
  },
  "policy": {
    "minimum_guest_svn": 10,
    "policy": 196639,
    "family_id": "AQAAAAAAAAAAAAAAAAAAAA==",
    "image_id": "AgAAAAAAAAAAAAAAAAAAAA==",
    "measurement": "DjsB8vCKPkzq09B10OLaMneKGLYSkZtBCNggH9m6gR/xUa+QYVOD+0qPqaRkt5YA",
    "report_id": "ZqNHf5ronrAf/PHj/8KSlB6EcBPg07B1BTh90edoFTo=",
    "trusted_id_key_hashes": [
      "A1YhWIKoJSeahbMAsLdCkx0RO/fjLd4uUP/efsdDykkezdfzNtwopuCyu1evekSj"
    ],
    "product": {}
  },
  "pcr_values": {
    "sha256": null,
    "sha384": null,
    "sha1": null
  }
}
```

### Azure Verification Process

**Token Validation:**

1. Parse JWT token header and payload
2. Extract JKU (JSON Key URL) from token header
3. Retrieve MAA public key set for signature verification
4. Validate token signature using retrieved keys
5. Extract and validate security claims from token payload

**Policy Enforcement:**

1. Decode hex-encoded claim values (familyId, imageId, measurement, etc.)
2. Validate security version numbers against minimum requirements
3. Construct attestation policy from validated claims
4. Apply policy to attestation verification process

## Google Cloud Platform Implementation

### GCP Direct Verification Model

GCP provides direct access to golden measurements and launch endorsements, enabling independent verification without relying on a centralized attestation service.

**Attestation Process:**

1. CVM generates SEV-SNP attestation report
2. Extract 384-bit measurement from report (offset 0x90, 48 bytes)
3. Use measurement to retrieve launch endorsement from GCP storage
4. Compare attestation values against golden measurements
5. Validate policy compliance and generate trust decision

### GCP Storage Integration

**TCB Integrity Bucket:**

- Bucket Name: `gce_tcb_integrity`
- Launch Endorsements: `ovmf_x64_csm/sevsnp/{measurement}.binarypb`
- OVMF Files: `ovmf_x64_csm/{digest}.fd`

**Launch Endorsement Structure:**

- Contains golden measurements for different vCPU configurations
- Includes SEV-SNP policy values and UEFI measurement data
- Serialized as protocol buffer format for structured access

### GCP Policy Generation

Attestation policies are constructed from launch endorsement data:

**Policy Components:**

- **SEV-SNP Policy**: Extracted from launch endorsement policy field
- **Golden Measurements**: Selected based on vCPU configuration
- **Root of Trust**: Configured for Milan product line with CRL checking enabled
- **Network Policy**: Configured to allow network access as needed

**Policy Structure:**

```yaml
Config:
  RootOfTrust:
    DisallowNetwork: false
    CheckCrl: true
    Product: "Milan"
    ProductLine: "Milan"
  Policy:
    Policy: [from launch endorsement]
    Measurement: [from launch endorsement for vCPU count]
```

**Sample Attestation Policy:**

```json
{
  "root_of_trust": {
    "product": "Milan",
    "check_crl": true,
    "product_line": "Milan"
  },
  "policy": {
    "policy": 458752,
    "measurement": "MJ8bHgaP5jkCNHIqclx6ZPnUU86hMnWg1XTzv8H4hkRQ6MjyiiRfoe1upoF6yFsr"
  },
  "pcr_values": {
    "sha256": null,
    "sha384": null,
    "sha1": null
  }
}
```

### GCP Verification Process

**Measurement Extraction:**

1. Parse SEV-SNP attestation report to binary format
2. Extract 384-bit measurement from offset 0x90 (48 bytes)
3. Convert measurement to hexadecimal string for storage lookup

**Golden Measurement Retrieval:**

1. Access GCP TCB integrity storage bucket
2. Retrieve launch endorsement using measurement as key
3. Parse protocol buffer format to extract endorsement data
4. Unmarshal UEFI golden measurement data

**Policy Enforcement:**

1. Extract SEV-SNP policy from launch endorsement
2. Select appropriate measurement based on vCPU configuration
3. Configure root of trust parameters for Milan platform
4. Apply policy to attestation verification process

## Verification Implementation

### Common Verification Components

**TEE Attestation Verification:**

- Converts attestation report to protocol buffer format
- Validates report structure and cryptographic signatures
- Enforces policy constraints against report claims
- Verifies nonce freshness and replay protection

**vTPM Attestation Verification:**

- Validates vTPM quote structure and signatures
- Checks PCR values against expected measurements
- Enforces PCR configuration policies
- Validates quote nonce for freshness

**Combined Attestation Verification:**

- Processes combined SEV-SNP and vTPM attestation reports
- Validates both hardware and software measurements
- Applies comprehensive policy enforcement
- Ensures attestation report consistency

### Policy Configuration

**Policy Loading:**

- Supports JSON-based policy configuration files
- Allows runtime policy updates and modifications
- Provides policy validation and verification
- Enables policy-as-code deployment patterns

**Policy Components:**

- **Check Config**: Defines verification parameters and constraints
- **Root of Trust**: Configures trust anchor and validation requirements
- **PCR Config**: Specifies Platform Configuration Register requirements
- **Policy Enforcement**: Defines security policy compliance requirements

## Security Considerations

### Cryptographic Integrity

**Hardware Root of Trust:**

- All measurements must chain to hardware root of trust
- Cryptographic signatures must be validated at each level
- Certificate chains must be verified against trusted roots

**Freshness Guarantees:**

- Nonces must be cryptographically secure and unique
- Attestation reports must be generated on-demand
- Replay attack prevention through nonce validation

### Platform-Specific Security

**Azure Security Model:**

- Trust in Microsoft Azure Attestation service integrity
- Dependency on Azure key management and PKI
- Reliance on Azure's internal verification processes
- Token-based trust with JWT signature validation
- Trust in closed source Microsoft virtal machine firmware and vTPM

**GCP Security Model:**

- Independent verification capability with golden measurements
- Direct access to launch endorsements and OVMF files, but the implementation is closed source
- Reduced dependency on cloud provider attestation services
- Transparent verification process with public measurement data

### Verification Robustness

**Error Handling:**

- Unknown measurements result in verification failure
- Missing required claims cause attestation rejection
- Network failures do not compromise security decisions
- Comprehensive input validation and sanitization

**Defense in Depth:**

- Multiple attestation sources (TEE + vTPM) provide redundancy
- Both hardware and software measurements are validated
- Policy enforcement occurs at multiple verification levels
- Fail-safe defaults ensure security in edge cases

## Integration Guidelines

### Provider Integration

**Azure Integration:**

- Configure MAA service endpoint URL
- Implement JWT token validation with proper signature verification
- Extract and validate all required security claims
- Handle MAA service availability and error conditions

**GCP Integration:**

- Configure access to GCP TCB integrity storage bucket
- Implement launch endorsement retrieval and parsing
- Validate measurement comparison logic
- Handle storage access patterns and error conditions

### Verifier Integration

**Policy Management:**

- Define attestation policies based on security requirements
- Implement policy loading and validation mechanisms
- Support dynamic policy updates and modifications
- Provide policy compliance reporting and auditing

**Verification Workflow:**

- Integrate with attestation providers for report generation
- Implement comprehensive verification logic for all attestation types
- Apply policy enforcement consistently across all verification paths
- Provide detailed verification results and error reporting

## Operational Considerations

### Performance Optimization

**Verification Efficiency:**

- Cache public keys and certificates for signature verification
- Optimize policy evaluation and enforcement logic
- Implement efficient measurement comparison algorithms
- Use appropriate data structures for policy storage and retrieval

**Resource Management:**

- Manage network connections to attestation services efficiently
- Implement appropriate timeout and retry mechanisms
- Handle large attestation reports and policy files efficiently
- Optimize memory usage for high-throughput verification scenarios

### Monitoring and Observability

**Verification Metrics:**

- Track attestation verification success and failure rates
- Monitor policy enforcement decisions and outcomes
- Measure verification latency and performance characteristics
- Collect detailed error information for troubleshooting

**Security Monitoring:**

- Monitor for attestation replay attempts and anomalies
- Track policy violations and security constraint failures
- Detect and alert on verification service availability issues
- Implement comprehensive audit logging for compliance requirements
