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
