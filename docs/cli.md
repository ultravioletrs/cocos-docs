# Agent CLI

The CLI allows you to perform various tasks related to the computation and management of algorithms, datasets and TEE. The CLI is a gRPC client for the agent service. To communicate with agent, digital signatures are required for auth against the roles such dataset provider.

## Build

To build the CLI, follow these steps:

1. Clone the repository: `go get github.com/ultravioletrs/cocos`.
2. Navigate to the project root: `cd cocos`.
3. Build the CLI binary: `make cli`.

## Usage

### Generate Keys

To generate a public & private key pair, run the following command:

```bash
./build/cocos-cli keys
```

This will generate a key pair of type rsa. Different key types can be generated using the `-k` flag. Currently supported types on cocos are rsa, ecdsa and ed25519.

```bash
./build/cocos-cli keys -k ecdsa
```

### Set Agent URL

For commands involving sending data to agent (data and algo upload, result fetching), the agent url is required since cli uses this to connect to the specified agent.

```shell
export AGENT_GRPC_URL=<agent_host:agent_port>
```

Agent port is found from the manager logs after the TEE has been provisioned and agent inserted.

### Upload Algorithm

To upload an algorithm, use the following command:

```bash
./build/cocos-cli algo /path/to/algorithm /path/to/private/key
```

Currently, support is provided for two types of algorithms: executable binaries and python files. The above command expects an algorithm in the binary format which will be executed inside agent. For python files, the algo file is required, along with the requirements file and the python runtime. To run a python file, use the following command:

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

To validate attestation report

```bash
./build/cocos-cli attestation validate <attestation_report_file_path> --report_data <report_data>
```

To validate the report data, the report data flag is compulsory.

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
./build/cocos-cli attestation hostdata <host-data> <backend_info.json>
```

The backend information is obtained from the backend that has SEV. Check [backend info readme](https://github.com/ultravioletrs/cocos/blob/main/scripts/backend_info/README.md) for information on how to run the script to generate backend info.

### Fetch AMD SEV-SNPs CA Bundle (ASK and ARK)

To fetch the CA bundle for SEV-SNP, use the following commands:

```bash
./build/cocos-cli ca-bundle <path_to_platform_info.json>
```

## Installation

To install the CLI locally, i.e. for the current user:

Run `cp ./build/cocos-cli $GOBIN`.

## Notes

- The CLI supports various configuration flags and options
- Use the `--help` flag with any command to see additionalinformation
- The CLI uses gRPC for communication with the Agent service
- All traffic between CLI and the TEE is encrypted via mutual TLS
