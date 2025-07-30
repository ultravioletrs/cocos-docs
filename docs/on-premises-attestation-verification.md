# On-premises

## Introduction

Cocos provides attestation verification capabilities for Confidential Virtual Machines (CVMs) running on-premises. The attestation framework establishes cryptographic proof of system integrity through hardware-backed Trusted Execution Environments (TEE) and Virtual Trusted Platform Modules (vTPM).

## Architecture

The Cocos attestation system consists of two primary attestation sources:

**TEE Attestation (SEV-SNP or TDX):**

- Hardware-generated attestation reports from AMD SEV-SNP processors
- Contains platform measurements, security version numbers, and policy validation
- Provides cryptographic proof of hardware integrity and guest isolation

**vTPM Attestation (only on SEV-SNP):**

- Virtual Trusted Platform Module quotes containing boot measurements
- PCR (Platform Configuration Register) values from the boot sequence
- Software component integrity measurements and configuration state

### Verification Flow

The attestation report is requested in two scenarios.

1. Using the CLI.
2. During the Attested TLS ([aTLS](./atls.md)) handshake.

In the first scenario, the CLI is used to fetch the attestation report, and the verification process is as follows.

- CLI requests the attestation report using the attestation get command.
- CVM Agent constructs the attestation report (SEV-SNP and vTPM; TDX) and sends it to the CLI.
- CLI verifies the attestation report using the attestation policy or the expected values of the attestation report provided by the user.

In the second scenario, the attestation report is fetched during the aTLS TLS handshake, and the verification process is as follows.

- The CVM Agent sends the attestation report (SEV-SNP and vTPM; TDX) to the CLI during the aTLS TLS handshake.
- The attestation report is verified during the TLS handshake using the attestation policy.

## AMD SEV-SNP

When using SEV-SNP CVM, the user gets the SEV-SNP attestation report and the vTPM attestation report. To ensure that the system is in a good state, the user needs to verify the attestation report.

### Attestation policy

An example of the attestation policy is shown below.

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

The `pcr_values` field contains the golden values of the PCR registers of the vTPM or expected values of PCR registers in the attestation report. The verification process will fail if any of the PCR values in the attestation report do not match the corresponding values in the `pcr_values` field.

The SEV-SNP policy contains reference values that must be checked against the values in the SEV-SNP attestation report. If the values do not match or if the values in the attestation report are out of range of the values in the SEV-SNP policy, then the verification will fail. The description of each field from the SEV-SNP attestation policy is shown below.

| Field                                | Description                                                                                     |
|--------------------------------------|-------------------------------------------------------------------------------------------------|
| `policy.chip_id`                     | Unique identifier of the physical SEV-SNP chip (base64-encoded 64 bytes).                       |
| `policy.family_id`                   | Family identifier of the VM image (base64-encoded).                                             |
| `policy.host_data`                   | Host-supplied input data (base64-encoded).                                                      |
| `policy.image_id`                    | Identifier of the VM image (base64-encoded).                                                    |
| `policy.measurement`                 | Cryptographic measurement (hash) of the VM launch blob.                                         |
| `policy.minimum_build`               | Minimum required SNP firmware build version.                                                    |
| `policy.minimum_launch_tcb`          | Minimum required TCB for launching a VM (uint64).                                               |
| `policy.minimum_tcb`                 | Minimum required TCB version for VM runtime (uint64).                                           |
| `policy.minimum_version`             | Minimum required SEV-SNP firmware version (e.g., "1.55").                                       |
| `policy.permit_provisional_firmware` | Whether to allow provisional (non-production) firmware.                                         |
| `policy.policy`                      | Raw policy bits as a 32-bit integer (bitmask).                                                  |
| `policy.product.name`                | Numeric identifier for the product platform (e.g., Milan = 1).                                  |
| `policy.report_id_ma`                | Masked report ID used to bind reports (base64-encoded).                                         |
| `policy.require_author_key`          | Whether launch requires a valid author key (false for on-premises CVM).                         |
| `policy.require_id_block`            | Whether launch requires an ID block (false for on-premises CVM).                                |
| `policy.vmpl`                        | VM Privilege Level of the attestation report (0–3).                                             |
| `root_of_trust.check_crl`            | Whether to check the Certificate Revocation List during attestation (true for on-premises CVM). |
| `root_of_trust.disallow_network`     | Whether to disallow network access during attestation (false for on-premises CVM).              |
| `root_of_trust.product`              | Name of the CPU product (e.g., "Milan"). Same as `root_of_trust.product_line`                   |

## Intel TDX

TDX offers Trust Domains (TDs), and TD is a synonym for CVM. The user needs to verify the TD Quote (attestation report) in order to ensure that the system is in a good state.

### Attestation policy

An example of the attestation policy is shown below.

```json
{
  "policy":  {
    "headerPolicy":  {
      "qeVendorId":  "k5pyM/ecTKmUCg2zlX8GBw=="
    },
    "tdQuoteBodyPolicy":  {
      "minimumTeeTcbSvn":  "BgEDAAAAAAAAAAAAAAAAAA==",
      "mrSeam":  "WzjjOmSHlYtyw8Eqk46qXj/UUQxRruq1jH1ezuQdfENkidbI5PkvFgt8rTQgewDB",
      "tdAttributes":  "AAAAEAAAAAA=",
      "xfam":  "5wIGAAAAAAA=",
      "mrTd":  "kesrRNFB1Ozgnwx1wsU9JHo8aO3X+v6KNSDJQqYEpAfeA65txfh/J0KLJTiHMRi3",
      "rtmrs":  [
        "TP/tWJG9nf1AuPrfS7mKBpBw05ffiZHYnbu01Tjr8cKeG+lNDwuxder+DJxTSSqW",
        "nVa/x1uzw8+NIKPbgFyHrfgMagE5Hx2dHKongs3Fz4WMS3tMSz1+AgtfPHmtHXav",
        "WPQUEjSVGcKM+j0uAkg1CXq09+iD6s3J9ZIK3zK0UtWVH167cwZDdLO8b3XzqVCM",
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
      ]
    }
  },
  "rootOfTrust":  {
    "checkCrl":  false,
    "getCollateral":  true
  }
}
```

The TDX policy contains reference values that must be checked against the values in the TDX Quote. If the values do not match, then the verification will fail. The description of each field from the TDX attestation policy is shown below.

| Field                                       | Description                                                                  |
|---------------------------------------------|------------------------------------------------------------------------------|
| `policy.headerPolicy.qeVendorId`            | Base64-encoded ID of the Quote Enclave vendor.                               |
| `policy.tdQuoteBodyPolicy.minimumTeeTcbSvn` | Minimum required TDX TCB SVN value (base64-encoded).                         |
| `policy.tdQuoteBodyPolicy.mrSeam`           | Measurement of the TDX Module (base64-encoded hash).                         |
| `policy.tdQuoteBodyPolicy.tdAttributes`     | TD attribute flags (base64-encoded).                                         |
| `policy.tdQuoteBodyPolicy.xfam`             | eXtended Features Available Mask (XFAM), base64-encoded.                     |
| `policy.tdQuoteBodyPolicy.mrTd`             | Measurement of the initial contents of the TD (base64-encoded hash).         |
| `policy.tdQuoteBodyPolicy.rtmrs[]`          | Array of Runtime Measurement Registers (RTMRs), each base64-encoded.         |
| `rootOfTrust.checkCrl`                      | Whether to check the Certificate Revocation List.                            |
| `rootOfTrust.getCollateral`                 | Whether to fetch necessary files for verification.                           |
