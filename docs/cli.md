# Agent CLI

The CLI allows you to perform various tasks related to the computation and management of algorithms, datasets and TEE. The CLI is a gRPC client for the agent service. To communicate with agent, digital signatures are required for auth against the roles such dataset provider.

## Build

To build the CLI, follow these steps:

1. Clone the repository: `go get github.com/ultravioletrs/cocos`.
2. Navigate to the project root: `cd cocos`.
3. Build the CLI binary: `make cli`.

## Usage

### Environment variables

#### Set Agent URL

For commands involving sending data to agent (data and algo upload, result fetching), the agent url is required since cli uses this to connect to the specified agent.

```shell
export AGENT_GRPC_URL=<agent_host:agent_port>
```

Agent port is found from the manager logs after the TEE has been provisioned and agent inserted.

#### Set Agent CA certificate path for TLS (optional)

To use TLS when communicating with Agent, paths to Agents CA root certificate needs to be specified.

```shell
export AGENT_GRPC_SERVER_CA_CERTS=<path_to_Agents_CA_root_certificate>
```

#### Set certificate paths for mTLS (optional)

To use mTLS when communicating with Agent, paths to CLI certificate and key files and Agents CA root certificate file need to be set.

```shell
export AGENT_GRPC_SERVER_CA_CERTS=<path_to_Agents_CA_root_certificate>
export AGENT_GRPC_CLIENT_CERT=<path_to_CLI_certificate_file>
export AGENT_GRPC_CLIENT_KEY=<path_to_CLI_key_file>
```

#### Set attestation options for aTLS (optional)

If the CLI is intended to use aTLS (Attested TLS), it is necessary to specify the path to Agents CA root certificate file, the attestation boolean flag as well as provide the path to the attestation policy JSON file.

```shell
export AGENT_GRPC_SERVER_CA_CERTS=<path_to_Agents_CA_root_certificate>
export AGENT_GRPC_ATTESTED_TLS=true
export AGENT_GRPC_ATTESTATION_POLICY=<path_to_attestation_policy_json_file>
```

If the Agent is configured to use a self-signed certificate (default), the path to Agents CA root certificate file can be [omitted](https://docs.cocos.ultraviolet.rs/agent/#certificates).

#### Set options for maTLS (optional)

If the CLI is intended to use maTLS (Mutually Attested TLS), it is necessary to specify variables for both mTLS and aTLS.

```shell
export AGENT_GRPC_SERVER_CA_CERTS=<path_to_Agents_CA_root_certificate>
export AGENT_GRPC_CLIENT_CERT=<path_to_CLI_certificate_file>
export AGENT_GRPC_CLIENT_KEY=<path_to_CLI_key_file>
export AGENT_GRPC_ATTESTED_TLS=true
export AGENT_GRPC_ATTESTATION_POLICY=<path_to_attestation_policy_json_file>
```

### Generate Keys

To generate a public & private key pair, run the following command:

```bash
./build/cocos-cli keys
```

This will generate a key pair of type rsa. Different key types can be generated using the `-k` flag. Currently supported types on cocos are rsa, ecdsa and ed25519.

```bash
./build/cocos-cli keys -k ecdsa
```

### Upload Algorithm

To upload an algorithm, use the following command:

```bash
./build/cocos-cli algo /path/to/algorithm /path/to/private/key
```

Currently, support is provided for four types of algorithms: executable binaries, Python files, Docker images (provided as tar files) and Wasm modules. The above command expects an algorithm in binary format that will be executed inside the secure VM by the agent. For Python files, the algo file, the requirements file, and the Python runtime are required. More information on how to run the other types of algorithms can be found [here](algorithms.md). To run a python file, use the following command:

```bash
./build/cocos-cli algo /path/to/algorithm /path/to/private/key --algorithm python --requirements /path/to/requirements.txt --python-runtime python
```

The agent grpc url is required for this operation, this will be available once the TEE has been provisioned and agent is running.

Supported flags:

```shell
  -a, --algorithm string        Algorithm type to run (default "bin")
  -h, --help                    help for algo
      --python-runtime string   Python runtime to use (default "python3")
  -r, --requirements string     Python requirements file
```

### Upload Dataset

To upload a dataset, use the following command:

```bash
./build/cocos-cli data /path/to/dataset.csv /path/to/private/key
```

The agent grpc url is required for this operation, this will be available once the TEE has been provisioned and agent is running.

### Retrieve Result

To retrieve the computation result, use the following command:

```bash
./build/cocos-cli result /path/to/private/key
```

If the result is available and agent is ready to receive the results, the result will be extracted and written to the current directory as `result.bin`.

The agent grpc url is required for this operation, this will be available once the TEE has been provisioned and agent is running.

### Fetch and Validate Attestation Report

To fetch or validate the attestation report, use the following commands.

To fetch attestation report:

```bash
./build/cocos-cli attestation get <report_data>
```

There can be three modes used to validate an attestation report as shown below:

```bash
validate <attestationreportfilepath> --report_data <reportdata> --product <product data>
validate --mode snp <attestationreportfilepath> --report_data <reportdata> --product <product data> //default
validate --mode vtpm <attestationreportfilepath> --nonce <noncevalue> --format <formatvalue> --output <outputvalue>
validate --mode snp-vtpm <attestationreportfilepath> --nonce <noncevalue> --format <formatvalue> --output <outputvalue>`,
```

Here is an example command to run to validate attestation report. The default mode is `snp`:

```bash
./build/cocos-cli attestation validate <attestation_report_file_path> --report_data <report_data> --product <product data>
```

To validate the report data, the report data flag is compulsory and the path to the attestation report file.

Optional Flags:

```shell
      --CA_bundles stringArray                  PEM format CA bundles for the AMD product. Combined with contents of cabundle_paths.
      --CA_bundles_paths stringArray            Paths to CA bundles for the AMD product. Must be in PEM format, ASK, then ARK certificates. If unset, uses embedded root certificates.
      --check_crl                               Download and check the CRL for revoked certificates.
      --chip_id bytesHex                        The expected MEASUREMENT field as a hex string. Must encode 48 bytes. Unchecked if unset.
      --config string                           Serialized json check.Config protobuf. This will overwrite individual flags. Unmarshalled as json.
      --family_id bytesHex                      The expected FAMILY_ID field as a hex string. Must encode 16 bytes. Unchecked if unset.
      --guest_policy uint                       The most acceptable guest SnpPolicy. (default 196608)
  -h, --help                                    help for validate
      --host_data bytesHex                      The expected HOST_DATA field as a hex string. Must encode 32 bytes. Unchecked if unset.
      --image_id bytesHex                       The expected IMAGE_ID field as a hex string. Must encode 16 bytes. Unchecked if unset.
      --max_retry_delay duration                Maximum Duration to wait between HTTP request retries. (default 30s)
      --measurement bytesHex                    The expected MEASUREMENT field as a hex string. Must encode 48 bytes. Unchecked if unset.
      --minimum_build uint32                    The 8-bit minimum build number for AMD-SP firmware
      --minimum_guest_svn uint32                The most acceptable GUEST_SVN.
      --minimum_lauch_tcb uint                  The minimum acceptable value for LAUNCH_TCB.
      --minimum_tcb uint                        The minimum acceptable value for CURRENT_TCB, COMMITTED_TCB, and REPORTED_TCB.
      --minimum_version string                  Minimum AMD-SP firmware API version (major.minor). Each number must be 8-bit non-negative. (default "0.0")
      --platform_info string                    The maximum acceptable PLATFORM_INFO field bit-wise. May be empty or a 64-bit unsigned integer
      --product string                          The AMD product name for the chip that generated the attestation report.
      --report_data bytesHex                    The expected REPORT_DATA field as a hex string. Must encode 64 bytes. Must be set.
      --report_id bytesHex                      The expected REPORT_ID field as a hex string. Must encode 32 bytes. Unchecked if unset.
      --report_id_ma bytesHex                   The expected REPORT_ID_MA field as a hex string. Must encode 32 bytes. Unchecked if unset.
      --require_author_key                      Require that AUTHOR_KEY_EN is 1.
      --require_id_block                        Require that the VM was launch with an ID_BLOCK signed by a trusted id key or author key
      --stepping string                         The machine stepping for the chip that generated the attestation report. Default unchecked.
      --timeout duration                        Duration to continue to retry failed HTTP requests. (default 2m0s)
      --trusted_author_key_hashes stringArray   Hex-encoded SHA-384 hash values of trusted author keys in AMD public key format
      --trusted_author_keys stringArray         Paths to x.509 certificates of trusted author keys
      --trusted_id_key_hashes stringArray       Hex-encoded SHA-384 hash values of trusted identity keys in AMD public key format
      --trusted_id_keys stringArray             Paths to x.509 certificates of trusted author keys
```

### File Hash

To run a computation, the hash of the files to be uploaded is provided along with the computation manifest. The file hash can be generated by cli, and this can be done using the following command:

```bash
./build/cocos-cli file-hash /path/to/file
```

### Backend Info

To change or add information about the backend, the following commands can be used.

To add measurement data:

```bash
./build/cocos-cli backend measurement <measurement> <backend_info.json>
```

To add host data:

```bash
./build/cocos-cli backend hostdata <host-data> <backend_info.json>
```

The backend information is obtained from the backend that has SEV. Check [backend info readme](https://github.com/ultravioletrs/cocos/blob/main/scripts/backend_info/README.md) for information on how to run the script to generate backend info.

### Fetch AMD SEV-SNPs CA Bundle (ASK and ARK)

To fetch the CA bundle for SEV-SNP, use the following commands:

```bash
./build/cocos-cli ca-bundle <path_to_platform_info.json>
```

### Measure IGVM file

We assume that our current working directory is the root of the cocos repository, both on the host machine and in the VM.

`igvmmeasure` calculates the launch measurement for an IGVM file and can generate a signed version. It ensures integrity by precomputing the expected launch digest, which can be verified against the attestation report. The tool parses IGVM directives, outputs the measurement as a hex string, or creates a signed file for verification at guest launch.

#### Example

We measure an IGVM file using our measure command, run:

```bash
./build/cocos-cli igvmmeasure /path/to/igvm/file
```

The tool will parse the directives in the IGVM file, calculate the launch measurement, and output the computed digest. If successful, it prints the measurement to standard output.

Here is a sample output

```bash
91c4929bec2d0ecf11a708e09f0a57d7d82208bcba2451564444a4b01c22d047995ca27f9053f86de4e8063e9f810548
```

### Create and Remove CVM

CLI can be used to create and remove cvms from manager:

```bash
./build/cocos-cli create-vm --log-level debug --server-url <server_host:server_port>
./build/cocos-cli remove-vm <cvm_id>
```

### Linux IMA

The Linux VM, which is used has, has [IMA](https://ima-doc.readthedocs.io/en/latest/ima-concepts.html) enalbed.
During the boot process every file is measured.
Users can download these measurements with the following command:

```bash
./build/cocos-cli ima-measurements <optional_file_name>
```

The file is verified using the TPM PCR10 SHA1 value.
Measurements of each file must be verified by user since we can't control everything tha goes in the image.

## Installation

To install the CLI locally, i.e. for the current user:

Run `cp ./build/cocos-cli $GOBIN`.

## Notes

- The CLI supports various configuration flags and options
- Use the `--help` flag with any command to see additionalinformation
- The CLI uses gRPC for communication with the agent service
- All traffic between CLI and the TEE is encrypted via mutual TLS

## 🧪 `validate` Command

The `validate` command validates and verifies attestation information from confidential virtual machines (CVMs). It supports multiple confidential computing (CC) platforms and modes:

- **Cloud Platforms**: `none` (default), `azure`, `gcp`
- **Validation Modes**: `snp` (default), `vtpm`, `snp-vtpm`, `tdx`

Depending on the selected mode, different flags are required to provide the necessary attestation data and expected claims.

### 🔧 Basic Syntax

```bash
./cocos-cli validate <attestation_report_file> [flags]
```

You must specify exactly one attestation report file path as the first positional argument.

### 💡 Examples

```bash
# SEV-SNP (default mode)
./cocos-cli validate report.bin --report_data <hex> --product <value> --platform snp

# SEV-SNP with explicit mode
./cocos-cli validate --mode snp report.bin --report_data <hex> --product <value>

# vTPM mode
./cocos-cli validate --mode vtpm report.json --nonce <hex> --format <string> --output <file>

# SNP-vTPM combined mode
./cocos-cli validate --mode snp-vtpm report.json --report_data <hex> --product <value> --nonce <hex> --format <string> --output <file>

# TDX mode
./cocos-cli validate --mode tdx report.json --report_data <hex>

# Cloud-specific (e.g., Azure + vTPM)
./cocos-cli validate --cloud azure --mode vtpm report.json --nonce <hex> --format <string> --output <file>
```

Supported Cloud Providers:

- none (default)
- azure
- gcp

#### Supported Modes

| Mode       | Description                       |
| ---------- | --------------------------------- |
| `snp`      | SEV-SNP attestation               |
| `vtpm`     | Virtual TPM attestation           |
| `snp-vtpm` | Hybrid SEV-SNP + vTPM attestation |
| `tdx`      | Intel TDX attestation             |

#### Example Usage

```bash
# SEV-SNP mode
cocos-cli validate report.bin --mode snp --report_data deadbeef... --product ConfidentialVM

# vTPM mode
cocos-cli validate report.bin --mode vtpm --nonce 1234abcd --format binarypb --output out.pb

# SEV-SNP + vTPM hybrid mode
cocos-cli validate report.bin --mode snp-vtpm --report_data deadbeef... --product ConfidentialVM --nonce 1234abcd --format textproto --output hybrid.txt

# TDX mode
cocos-cli validate report.bin --mode tdx --report_data deadbeef...
```

## 🏗️ Flags and Options

### 🔧 Global Flags

| Flag       | Type   | Default | Description                                                   |
| ---------- | ------ | ------- | ------------------------------------------------------------- |
| `--cloud`  | string | `none`  | Confidential computing cloud provider: `none`, `azure`, `gcp` |
| `--mode`   | string | `snp`   | Validation mode: `snp`, `vtpm`, `snp-vtpm`, `tdx`             |
| `--config` | string |         | Path to serialized `check.Config` JSON file                   |
| `--output` | string |         | Path to write verification results                            |

---

### 🧪 Mode-Specific Flags

#### 🟣 SNP Mode (`--mode snp`)

| Flag            | Type     | Description                        |
| --------------- | -------- | ---------------------------------- |
| `--report_data` | bytesHex | 64-byte hex string for REPORT_DATA |
| `--product`     | string   | Product string                     |
| `--platform`    | string   | Platform descriptor                |

#### 🔵 vTPM Mode (`--mode vtpm`)

| Flag       | Type     | Description                              |
| ---------- | -------- | ---------------------------------------- |
| `--nonce`  | bytesHex | Hex-encoded nonce for vTPM attestation   |
| `--format` | string   | Output format for the attestation report |
| `--output` | string   | Path to write the verification result    |

#### 🟡 SNP-vTPM Mode (`--mode snp-vtpm`)

Combines required flags from both SNP and vTPM modes:

- `--report_data`
- `--product`
- `--nonce`
- `--format`
- `--output`

#### 🟢 TDX Mode (`--mode tdx`)

| Flag            | Type     | Description                |
| --------------- | -------- | -------------------------- |
| `--report_data` | bytesHex | Expected REPORT_DATA field |

## 🧊 TDX Verification Flags

| Flag                    | Type     | Description                                              |
| ----------------------- | -------- | -------------------------------------------------------- |
| `--qe_vendor_id`        | bytesHex | Expected QE_VENDOR_ID (16 bytes hex).                    |
| `--mr_seam`             | bytesHex | Expected MR_SEAM (48 bytes hex).                         |
| `--td_attributes`       | bytesHex | Expected TD_ATTRIBUTES (8 bytes hex).                    |
| `--xfam`                | bytesHex | Expected XFAM (8 bytes hex).                             |
| `--mr_td`               | bytesHex | Expected MR_TD (48 bytes hex).                           |
| `--mr_config_id`        | bytesHex | Expected MR_CONFIG_ID (48 bytes hex).                    |
| `--mr_owner`            | bytesHex | Expected MR_OWNER (48 bytes hex).                        |
| `--mr_config_owner`     | bytesHex | Expected MR_OWNER_CONFIG (48 bytes hex).                 |
| `--minimum_tee_tcb_svn` | bytesHex | Minimum TEE_TCB_SVN value (16 bytes hex).                |
| `--rtmrs`               | string   | Comma-separated 4 hex strings (each 48 bytes) for RTMRS. |
| `--trusted_root`        | string   | Comma-separated PEM paths for root CA certs (Intel TDX). |
| `--minimum_qe_svn`      | uint32   | Minimum QE_SVN value.                                    |
| `--minimum_pce_svn`     | uint32   | Minimum PCE_SVN value.                                   |
| `--get_collateral`      | bool     | Allow downloading collateral if required.                |

---

## 🔒 SEV-SNP Verification Flags

| Flag                          | Type      | Description                                                            |
| ----------------------------- | --------- | ---------------------------------------------------------------------- |
| `--host_data`                 | bytesHex  | Expected `HOST_DATA` field (32 bytes).                                 |
| `--family_id`                 | bytesHex  | Expected `FAMILY_ID` (16 bytes).                                       |
| `--image_id`                  | bytesHex  | Expected `IMAGE_ID` (16 bytes).                                        |
| `--report_id`                 | bytesHex  | Expected `REPORT_ID` (32 bytes).                                       |
| `--report_id_ma`              | bytesHex  | Expected `REPORT_ID_MA` (32 bytes).                                    |
| `--measurement`               | bytesHex  | Expected `MEASUREMENT` (48 bytes).                                     |
| `--chip_id`                   | bytesHex  | Expected `CHIP_ID` (48 bytes).                                         |
| `--minimum_tcb`               | uint64    | Minimum acceptable for `CURRENT_TCB`, `COMMITTED_TCB`, `REPORTED_TCB`. |
| `--minimum_lauch_tcb`         | uint64    | Minimum acceptable `LAUNCH_TCB`.                                       |
| `--guest_policy`              | uint64    | Most acceptable guest `SnpPolicy`.                                     |
| `--minimum_guest_svn`         | uint32    | Minimum acceptable `GUEST_SVN`.                                        |
| `--minimum_build`             | uint32    | Minimum AMD-SP firmware build (8-bit).                                 |
| `--require_author_key`        | bool      | Enforce `AUTHOR_KEY_EN == 1`.                                          |
| `--require_id_block`          | bool      | Require signed `ID_BLOCK`.                                             |
| `--check_crl`                 | bool      | Enable CRL download/check for revoked certs.                           |
| `--timeout`                   | duration  | Retry timeout duration (e.g. `5s`, `30s`).                             |
| `--max_retry_delay`           | duration  | Max delay between retry attempts.                                      |
| `--platform_info`             | string    | Max acceptable `PLATFORM_INFO` (64-bit).                               |
| `--minimum_version`           | string    | Minimum AMD-SP API version: `major.minor`.                             |
| `--trusted_author_keys`       | \[]string | Paths to trusted author key certs (PEM).                               |
| `--trusted_author_key_hashes` | \[]string | SHA-384 hex hashes of trusted author keys.                             |
| `--trusted_id_keys`           | \[]string | Paths to trusted identity key certs.                                   |
| `--trusted_id_key_hashes`     | \[]string | SHA-384 hex hashes of identity keys.                                   |
| `--product`                   | string    | AMD product name (e.g. "Milan").                                       |
| `--stepping`                  | string    | Machine stepping info.                                                 |
| `--CA_bundles_paths`          | \[]string | Paths to PEM-formatted CA bundles (ASK, ARK).                          |
| `--CA_bundles`                | \[]string | Direct PEM strings of CA bundles.                                      |

## 🌿 Environment Variables

| Variable               | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `COCOS_VERIFY_TIMEOUT` | Default timeout override for HTTP retries   |
| `COCOS_VERIFY_CA_PATH` | Default path to root CA bundles             |
| `COCOS_DEBUG`          | If set to `1`, enables verbose debug output |

---

## 💡 Usage Examples

### Minimum verification with measurement

```bash
cocos-cli verify --measurement 0123...ABCD
```

### Full policy validation

```bash
cocos-cli verify \
  --host_data DEAD...BEEF \
  --measurement 1234...EF90 \
  --minimum_tcb 0x0500000500000000 \
  --require_author_key \
  --trusted_author_keys ./certs/author.pem \
  --CA_bundles_paths ./certs/bundle.pem
```

### Using environment variable for debug

```bash
export COCOS_DEBUG=1
cocos-cli verify --measurement ...
```

---

## 📚 Workflow Example

1. Retrieve the SEV-SNP attestation report (binary blob)
2. Extract relevant fields (`MEASUREMENT`, `HOST_DATA`, etc.)
3. Run `cocos-cli verify` with matching flags
4. If verification fails, review flags and root of trust chain

---

## ⚠️ Error Codes & Troubleshooting

| Exit Code | Meaning                           | Suggested Fix                                               |
| --------- | --------------------------------- | ----------------------------------------------------------- |
| `1`       | Invalid input or malformed hex    | Ensure hex-encoded strings are correct size (e.g. 32 bytes) |
| `2`       | Attestation report mismatch       | Check measurement or policy fields provided                 |
| `3`       | Certificate or CA bundle error    | Ensure proper PEM formatting and order: ASK, ARK            |
| `4`       | HTTP failure on CRL fetch         | Retry with `--check_crl=false` or extend `--timeout`        |
| `5`       | Incompatible AMD firmware version | Set appropriate `--minimum_version` or upgrade firmware     |
| `255`     | Unknown fatal error               | Enable debug via `COCOS_DEBUG=1` and report log             |

### `cocos-cli policy`

**Description:** Root command for attestation policy management.

```sh
cocos-cli policy [command] [flags]
```

#### Global Flags

| Flag              | Type | Default | Description           |
| ----------------- | ---- | ------- | --------------------- |
| `-h`, `--help`    | bool | false   | Show help message     |
| `-v`, `--verbose` | bool | false   | Enable verbose output |

---

## 🔧 Subcommands

### 1. `azure`

**Description:** Generate attestation policy for Azure CVM.

```sh
cocos-cli policy azure <azure_maa_token_file> <product_name> [--policy=<uint64>]
```

#### Flags

| Flag       | Type   | Default | Description            |
| ---------- | ------ | ------- | ---------------------- |
| `--policy` | uint64 | 196639  | Guest CVM policy value |

#### Output

- `attestation_policy.json` generated in current directory.

#### Example

```sh
cocos-cli policy azure azure_maa.jwt MyProduct --policy=196639
```

---

### 2. `gcp`

**Description:** Generate attestation policy for GCP CVM.

```sh
cocos-cli policy gcp <bin_vtmp_attestation_report_file> <vcpu_count>
```

#### Output

- `attestation_policy.json` generated in current directory.

#### Example

```sh
cocos-cli policy gcp gcp_attestation.bin 4
```

---

### 3. `download`

**Description:** Download and verify GCP OVMF firmware.

```sh
cocos-cli policy download <bin_vtmp_attestation_report_file>
```

#### Output

- `ovmf.fd` downloaded and validated

#### Example

```sh
cocos-cli policy download gcp_attestation.bin
```

---

### 4. `hostdata`

**Description:** Add base64-encoded host data to policy file.

```sh
cocos-cli policy hostdata <base64-host-data> <attestation_policy.json>
```

#### Input Requirements

- `base64-host-data` must decode to **32 bytes**.

#### Example

```sh
cocos-cli policy hostdata bXlob3N0ZGF0YWJhc2U2NA== attestation_policy.json
```

---

### 5. `measurement`

**Description:** Add base64-encoded measurement to policy file.

```sh
cocos-cli policy measurement <base64-measurement> <attestation_policy.json>
```

#### Input Requirements

- `base64-measurement` must decode to **48 bytes**.

#### Example

```sh
cocos-cli policy measurement bXltZWFzdXJlbWVudGJhc2U2NA== attestation_policy.json
```

---

## 🔁 Usage Patterns & Workflows

### 🧪 Azure CVM Attestation

1. Get MAA token and save to `azure_maa.jwt`
2. Run:

```sh
cocos-cli policy azure azure_maa.jwt ConfidentialLinux --policy=196639
```

### 🔐 GCP CVM Attestation + OVMF Verification

1. Save GCP attestation to `gcp_attestation.bin`
2. Generate policy:

```sh
cocos-cli policy gcp gcp_attestation.bin 2
```

3. Download OVMF file:

```sh
cocos-cli policy download gcp_attestation.bin
```

### 🛠️ Add Custom Fields to Policy

```sh
cocos-cli policy hostdata <base64> attestation_policy.json
cocos-cli policy measurement <base64> attestation_policy.json
```

---

## 🚨 Error Codes & Troubleshooting

| Error Message                           | Cause                                                 | Resolution                                     |
| --------------------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| `base64 string could not be decoded`    | Invalid base64 input                                  | Check that input is correctly base64-encoded   |
| `data does not have an adequate length` | Decoded hostdata ≠ 32 bytes or measurement ≠ 48 bytes | Check the size of your base64-decoded data     |
| `failed to unmarshal json`              | JSON in policy file is malformed                      | Verify or regenerate `attestation_policy.json` |
| `digest mismatch`                       | Downloaded OVMF does not match GCP launch endorsement | Confirm that attestation and OVMF are aligned  |
| `error writing attestation policy file` | File system or permission issue                       | Check write permissions and disk space         |

---
