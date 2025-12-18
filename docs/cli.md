# COCOS CLI Documentation

The COCOS CLI (`cocos-cli`) is a comprehensive command-line interface that allows you to perform various tasks related to the computation and management of algorithms, datasets, and Trusted Execution Environments (TEE).

## Overview

The CLI serves as a gRPC client for both the Agent and Manager services, providing:

- **Secure Communication:** All interactions use encrypted channels (TLS/mTLS/aTLS)
- **Digital Authentication:** Digital signatures are required for authentication against roles such as dataset providers
- **Multi-Service Integration:** Connects to both Agent (computation) and Manager (VM lifecycle) services
- **Cross-Platform Support:** Built in Go for compatibility across operating systems

## Target Users

This documentation is designed for:

- **System Administrators:** Performing manual tasks and system management
- **Developers:** Integrating CLI into applications and automation workflows
- **Support Teams:** Diagnosing issues and troubleshooting problems
- **Security Engineers:** Understanding attestation and verification processes

## Build

To build the CLI, follow these steps:

1. Clone the repository: `go get github.com/ultravioletrs/cocos`.
2. Navigate to the project root: `cd cocos`.
3. Build the CLI binary: `make cli`.

## Installation

To install the CLI locally, i.e. for the current user:

Run `cp ./build/cocos-cli $GOBIN`.

## Notes

- The CLI supports various configuration flags and options
- Use the `--help` flag with any command to see additional information
- The CLI uses gRPC for communication with the agent service
- All traffic between CLI and the TEE is encrypted via mutual TLS

## Usage

### Environment Variables

#### Set Agent URL

For commands involving sending data to agent (data and algo upload, result
fetching), the agent url is required since cli uses this to connect to the
specified agent.

```shell
export AGENT_GRPC_URL=<agent_host:agent_port>
```

Agent port is found from the manager logs after the TEE has been provisioned
and agent inserted.

#### Set Manager URL

For VM management operations (create-vm, remove-vm), the manager service URL
is required.

```shell
export MANAGER_GRPC_URL=<manager_host:manager_port>
```

#### Set Manager Certificate Paths for TLS/mTLS (optional)

To use TLS/mTLS when communicating with Manager service:

```shell
export MANAGER_GRPC_SERVER_CA_CERTS=<path_to_Manager_CA_root_certificate>
export MANAGER_GRPC_CLIENT_CERT=<path_to_CLI_certificate_file>
export MANAGER_GRPC_CLIENT_KEY=<path_to_CLI_key_file>
```

#### Set IGVM Binary Path (optional)

Specifies the path to the IGVM measurement binary:

```shell
export IGVM_BINARY_PATH=<path_to_igvmmeasure>  # Default: "./build/igvmmeasure"
```

#### Set Agent CA Certificate Path for TLS (optional)

To use TLS when communicating with Agent, paths to Agents CA root certificate
needs to be specified.

```shell
export AGENT_GRPC_SERVER_CA_CERTS=<path_to_Agents_CA_root_certificate>
```

#### Set Certificate Paths for mTLS (optional)

To use mTLS when communicating with Agent, paths to CLI certificate and key
files and Agents CA root certificate file need to be set.

```shell
export AGENT_GRPC_SERVER_CA_CERTS=<path_to_Agents_CA_root_certificate>
export AGENT_GRPC_CLIENT_CERT=<path_to_CLI_certificate_file>
export AGENT_GRPC_CLIENT_KEY=<path_to_CLI_key_file>
```

#### Set Attestation Options for aTLS (optional)

If the CLI is intended to use aTLS (Attested TLS), it is necessary to specify
the path to Agents CA root certificate file, the attestation boolean flag as
well as provide the path to the attestation policy JSON file.

```shell
export AGENT_GRPC_SERVER_CA_CERTS=<path_to_Agents_CA_root_certificate>
export AGENT_GRPC_ATTESTED_TLS=true
export AGENT_GRPC_ATTESTATION_POLICY=<path_to_attestation_policy_json_file>
```

If the Agent is configured to use a self-signed certificate (default), the
path to Agents CA root certificate file can be
[omitted](https://docs.cocos.ultraviolet.rs/agent/#certificates).

#### Set Options for maTLS (optional)

If the CLI is intended to use maTLS (Mutually Attested TLS), it is necessary
to specify variables for both mTLS and aTLS.

```shell
export AGENT_GRPC_SERVER_CA_CERTS=<path_to_Agents_CA_root_certificate>
export AGENT_GRPC_CLIENT_CERT=<path_to_CLI_certificate_file>
export AGENT_GRPC_CLIENT_KEY=<path_to_CLI_key_file>
export AGENT_GRPC_ATTESTED_TLS=true
export AGENT_GRPC_ATTESTATION_POLICY=<path_to_attestation_policy_json_file>
```

## Environment Variables Configuration Errors

This troubleshooting guide covers common errors when configuring environment variables for CLI agent communication.

### Agent URL Configuration Errors

#### Connection Refused

```text
Error: connection refused
Error: dial tcp <host>:<port>: connect: connection refused
```

**Cause:** Agent not reachable or wrong URL

**Resolution:**

- Verify TEE is provisioned and agent is running
- Check agent port from manager logs
- Test connectivity: `nc -z <host> <port>`

#### Invalid URL Format

```text
Error: invalid URL format, missing port
Error: missing port in address
```

**Cause:** Malformed `AGENT_GRPC_URL`

**Resolution:**

```bash
# Correct format
export AGENT_GRPC_URL=localhost:50051
export AGENT_GRPC_URL=192.168.1.100:50051

# Incorrect formats to avoid
export AGENT_GRPC_URL=localhost         # Missing port
export AGENT_GRPC_URL=http://localhost  # Don't include protocol
```

### Certificate File Errors

#### File Not Found

```text
Error: no such file or directory
Error: could not load certificate file
```

**Cause:** Invalid certificate file paths

**Resolution:**

- Use absolute paths for certificate files
- Verify files exist: `ls -la <certificate_path>`
- Check file permissions: `test -r <certificate_path>`

#### Permission Denied

```text
Error: permission denied
Error: open <path>: permission denied
```

**Cause:** Insufficient permissions to read certificate files

**Resolution:**

```bash
# Fix certificate permissions
chmod 644 /path/to/certificate.pem    # For certificates
chmod 600 /path/to/private.key        # For private keys
```

#### Invalid Certificate Format

```text
Error: failed to parse certificate
Error: invalid PEM format
```

**Cause:** Corrupted or wrong format certificate

**Resolution:**

- Verify certificate format: `openssl x509 -in <cert> -text -noout`
- Ensure proper PEM format with correct headers/footers
- Check certificate hasn't expired

### TLS Configuration Errors

#### Missing mTLS Files

```text
Error: client certificate specified but no client key
Error: both client certificate and key must be provided
```

**Cause:** Incomplete mTLS configuration

**Resolution:**

```bash
# Both certificate and key required for mTLS
export AGENT_GRPC_CLIENT_CERT=/path/to/client.crt
export AGENT_GRPC_CLIENT_KEY=/path/to/client.key
```

#### Certificate Key Mismatch

```text
Error: private key does not match certificate
Error: tls: private key does not match public key
```

**Cause:** Client certificate and private key don't match

**Resolution:**

- Verify certificate and key are a matching pair
- Regenerate certificate/key pair if needed
- Ensure using correct files for the same identity

#### TLS Handshake Failed

```text
Error: transport: authentication handshake failed
Error: connection reset by peer
```

**Cause:** TLS configuration mismatch between client and server

**Resolution:**

- Ensure both client and agent use same TLS settings
- Check if agent expects TLS but client uses plain connection
- Verify certificate chain is valid

### Attestation Configuration Errors

#### Invalid Boolean Value

```text
Error: invalid boolean value
Error: strconv.ParseBool: parsing "<value>": invalid syntax
```

**Cause:** Invalid value for `AGENT_GRPC_ATTESTED_TLS`

**Resolution:**

```bash
# Correct boolean values
export AGENT_GRPC_ATTESTED_TLS=true   # Enable
export AGENT_GRPC_ATTESTED_TLS=false  # Disable
# Or leave unset for false

# Incorrect values to avoid
export AGENT_GRPC_ATTESTED_TLS=yes    # Use "true"
export AGENT_GRPC_ATTESTED_TLS=1      # Use "true"
```

#### Missing Attestation Policy

```text
Error: attestation policy file required when aTLS enabled
Error: attestation policy not specified
```

**Cause:** aTLS enabled without policy file

**Resolution:**

```bash
export AGENT_GRPC_ATTESTED_TLS=true
export AGENT_GRPC_ATTESTATION_POLICY=/path/to/policy.json
```

#### Invalid Policy File

```text
Error: failed to parse attestation policy
Error: invalid JSON
Error: attestation policy validation failed
```

**Cause:** Malformed attestation policy JSON file

**Resolution:**

- Validate JSON syntax: `json_pp < policy.json`
- Check file exists and is readable
- Ensure required policy fields are present
- Verify proper JSON structure

### Environment Variable Errors

#### Variable Not Set

```text
Error: environment variable not found
Error: AGENT_GRPC_URL not set
```

**Cause:** Environment variable not exported

**Resolution:**

```bash
# Ensure 'export' is used
export AGENT_GRPC_URL=localhost:50051

# Verify variable is set
echo $AGENT_GRPC_URL
```

#### Path Resolution Issues

```text
Error: no such file or directory
Error: relative path resolution failed
```

**Cause:** Relative paths that don't resolve correctly

**Resolution:**

- Use absolute paths: `/full/path/to/certificate.pem`
- Avoid tilde (`~`) expansion in scripts
- Resolve paths explicitly if needed

### Agent State Errors

#### Service Unavailable

```text
Error: agent service unavailable
Error: service temporarily unavailable
```

**Cause:** Agent not ready or TEE not provisioned

**Resolution:**

- Wait for TEE provisioning to complete
- Check manager logs for agent startup confirmation
- Verify agent service is running

#### Cannot Find Agent Port

```text
Error: failed to determine agent port
Error: permission denied reading manager logs
```

**Cause:** Cannot access manager logs to find agent port

**Resolution:**

- Check manager log file permissions
- Verify correct path to manager logs
- Look for agent port in logs after TEE provisioning

## Quick Configuration Check

Before running CLI commands, validate your setup:

```bash
# Check required variables
echo "Agent URL: $AGENT_GRPC_URL"
echo "CA Certs: $AGENT_GRPC_SERVER_CA_CERTS"
echo "aTLS Enabled: $AGENT_GRPC_ATTESTED_TLS"

# Test basic connectivity
timeout 5 nc -z ${AGENT_GRPC_URL%:*} ${AGENT_GRPC_URL##*:} && echo "Agent reachable"

# Check certificate files exist
test -r "$AGENT_GRPC_SERVER_CA_CERTS" && echo "CA cert accessible"
test -r "$AGENT_GRPC_CLIENT_CERT" && echo "Client cert accessible"
test -r "$AGENT_GRPC_CLIENT_KEY" && echo "Client key accessible"
```

## Common Resolution Steps

1. **Verify agent is running** - Check TEE provisioning status
2. **Use absolute paths** - Avoid relative paths for certificate files
3. **Check file permissions** - Ensure certificates are readable
4. **Validate JSON files** - Use `json_pp` to check policy files
5. **Test connectivity** - Use `nc` or similar tools to verify network access
6. **Check manager logs** - Find correct agent port and startup status

## CLI Architecture and Design

### Framework and Dependencies

The CLI is built using:

- **Cobra Framework:** Command-line interface framework with subcommands
- **gRPC:** Communication with Agent and Manager services
- **TLS/mTLS/aTLS:** Secure communication protocols
- **Go-based:** Written in Go for cross-platform compatibility

### Connection Management

The CLI maintains persistent connections to:

1. **Agent Service:** For computation operations (algo, data, result)
2. **Manager Service:** For VM lifecycle management (create-vm, remove-vm)
3. **Certificate Management:** Automatic certificate validation and renewal
4. **Retry Logic:** Configurable timeouts and automatic retry mechanisms

### Authentication System

All operations use digital signature authentication:

- **Supported Algorithms:** RSA (4096-bit), ECDSA (P-256), Ed25519
- **Key Formats:** PKCS#1, PKCS#8, EC private keys in PEM encoding
- **Signature Verification:** Server-side verification of all operations
- **Key Generation:** Built-in key generation with proper permissions

### Error Handling and User Experience

The CLI provides comprehensive error handling:

- **gRPC Status Translation:** Converts gRPC errors to user-friendly messages
- **Color-coded Output:** Red for errors, green for success
- **Verbose Mode:** Detailed logging for troubleshooting
- **Graceful Degradation:** Handles network issues and service unavailability

### File and Data Handling

**Automatic Processing:**

- Directory compression (ZIP format)
- Streaming uploads for large files
- Temporary file management and cleanup
- File integrity verification

**Supported Formats:**

- Binary executables
- Python scripts with requirements
- Docker images (tar format)
- WebAssembly modules
- Compressed datasets

## CLI Commands Documentation

The CLI (`cocos-cli`) provides commands to retrieve and validate attestations
from various Trusted Execution Environment (TEE) technologies including
SEV-SNP, vTPM, TDX, and Azure attestation tokens.

### CLI Usage

```bash
cocos-cli [command]
```

### Global Flags

- `-h, --help`: Help for cocos-cli
- `-v, --verbose`: Enable verbose output

## Available Commands

| Command            | Description                                  | Authentication Required | Service Required | Help Command                        |
|--------------------|----------------------------------------------|-------------------------|------------------|-------------------------------------|
| `algo`             | Upload an algorithm binary                   | ✓ (Private Key)         | Agent            | `cocos-cli algo --help`             |
| `attestation`      | Get and validate attestations                | ✗                       | Agent            | `cocos-cli attestation --help`      |
| `ca-bundle`        | Fetch AMD SEV-SNPs CA Bundle (ASK and ARK)   | ✗                       | None             | `cocos-cli ca-bundle --help`        |
| `checksum`         | Compute the sha3-256 hash of a file          | ✗                       | None             | `cocos-cli checksum --help`         |
| `completion`       | Generate shell completion scripts            | ✗                       | None             | `cocos-cli completion --help`       |
| `create-vm`        | Create a new virtual machine                 | ✓ (Optional mTLS)       | Manager          | `cocos-cli create-vm --help`        |
| `data`             | Upload a dataset                             | ✓ (Private Key)         | Agent            | `cocos-cli data --help`             |
| `help`             | Help about any command                       | ✗                       | None             | `cocos-cli help [command]`          |
| `igvmmeasure`      | Measure an IGVM file                         | ✗                       | None             | `cocos-cli igvmmeasure --help`      |
| `ima-measurements` | Retrieve Linux IMA measurements file         | ✗                       | Agent            | `cocos-cli ima-measurements --help` |
| `keys`             | Generate a new public/private key pair       | ✗                       | None             | `cocos-cli keys --help`             |
| `policy`           | Change attestation policy                    | ✗                       | Varies           | `cocos-cli policy --help`           |
| `remove-vm`        | Remove a virtual machine                     | ✓ (Optional mTLS)       | Manager          | `cocos-cli remove-vm --help`        |
| `result`           | Retrieve computation result file             | ✓ (Private Key)         | Agent            | `cocos-cli result --help`           |
| `sevsnpmeasure`    | Calculate AMD SEV/SEV-ES/SEV-SNP measurement | ✗                       | None             | `cocos-cli sevsnpmeasure --help`    |

## Command: `algo`

Upload an algorithm binary

**Usage:**

```bash
cocos-cli algo [flags]
```

Currently, support is provided for four types of algorithms: executable
binaries, Python files, Docker images (provided as tar files) and Wasm
modules. The above command expects an algorithm in binary format that will be
executed inside the secure VM by the agent. For Python files, the algo file,
the requirements file, and the Python runtime are required. Different algorithm types require specific configurations and dependencies.

**Arguments:**

- `<algo_file>`: Path to the algorithm file
- `<private_key_file_path>`: Path to the private key file

**Flags:**

- `-a, --algorithm string`: Algorithm type to run (default "bin")
- `--args stringArray`: Arguments to pass to the algorithm
- `-h, --help`: Help for algo
- `--python-runtime string`: Python runtime to use (default "python3")
- `-r, --requirements string`: Python requirements file

**Global Flags:**

- `-v, --verbose`: Enable verbose output

**Authentication:**

All agent operations require digital signature authentication using RSA, ECDSA, or Ed25519 private keys. The CLI supports the following key formats:

- PKCS#1 RSA private keys
- PKCS#8 private keys (RSA, ECDSA, Ed25519)
- EC private keys
- PEM encoding required for all keys

**Algorithm Types:**

The CLI supports four types of algorithms through the `-a, --algorithm` flag:

1. **Binary Executables** (`bin` - default):

   ```bash
   ./build/cocos-cli algo binary_algo.bin private_key.pem
   ```

2. **Python Scripts** (`python`):

   ```bash
   ./build/cocos-cli algo -a python script.py private_key.pem \
     -r requirements.txt --python-runtime python3
   ```

3. **Docker Images** (`docker` - as tar files):

   ```bash
   ./build/cocos-cli algo -a docker image.tar private_key.pem
   ```

4. **WebAssembly Modules** (`wasm`):

   ```bash
   ./build/cocos-cli algo -a wasm module.wasm private_key.pem
   ```

**Algorithm Arguments:**

Pass arguments to the algorithm using the `--args` flag:

```bash
./build/cocos-cli algo binary_algo.bin private_key.pem \
  --args="--input=data.csv" --args="--output=result.json"
```

**File Handling:**

- The CLI automatically handles file compression and temporary file management
- Large files are processed using streaming for optimal performance
- Proper cleanup of temporary files is performed automatically

**Example:**

```bash
./build/cocos-cli algo <algo_file> <private_key_file_path>
```

## Command: `attestation`

```bash
cocos-cli attestation [command]
```

**Description:** Get and validate attestations

**Usage:**

- Displays available subcommands
- Shows command flags and usage information
- Provides help for the attestation command family

### Subcommand: `attestation get`

```bash
cocos-cli attestation get <attestation-type> [flags]
```

**Description:** Retrieve attestation information from agent

**Arguments:**

- `<attestation-type>` (required): Type of the report to retrieve

**Valid Attestation Types:**

- `snp` - SEV-SNP attestation report
- `vtpm` - vTPM report
- `snp-vtpm` - Combined SEV-SNP and vTPM report
- `azure-token` - Azure attestation token
- `tdx` - TDX attestation report

**Error Handling:**

- Command requires exactly 1 argument (the attestation type)
- Running without arguments shows:
  `Error: accepts 1 arg(s), received 0`

### Command-Line Options and Parameters

All attestation commands support standard CLI flags for help and completion.

#### Get Command Flags

| Flag                | Short | Type     | Description                         | Required For               |
| ------------------- | ----- | -------- | ----------------------------------- | -------------------------- |
| `--tee`             |       | bytesHex | Nonce for SNP/TDX (512 bit hex)     | `snp`, `snp-vtpm`, `tdx`   |
| `--vtpm`            |       | bytesHex | Nonce for vTPM (256 bit hex)        | `vtpm`, `snp-vtpm`         |
| `--token`           |       | bytesHex | Nonce for Azure token (256 bit hex) | `azure-token`              |
| `--azurejwt`        | `-t`  | boolean  | Get Azure token in JWT format       | Optional for `azure-token` |
| `--reporttextproto` | `-r`  | boolean  | Get report in textproto format      | Optional                   |
| `--help`            | `-h`  | boolean  | Show help for the get command       | Optional                   |

#### Global Flags for Attestation

| Flag        | Short | Type    | Description           |
| ----------- | ----- | ------- | --------------------- |
| `--verbose` | `-v`  | boolean | Enable verbose output |

### Basic Usage Examples

#### SEV-SNP Attestation

```bash
# Retrieve SEV-SNP attestation with 512-bit hex nonce
./build/cocos-cli attestation get snp --tee 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

#### vTPM Attestation

```bash
# Retrieve vTPM report with 256-bit hex nonce
./build/cocos-cli attestation get vtpm --vtpm 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890
```

#### Combined SEV-SNP and vTPM Attestation

```bash
# Retrieve both SEV-SNP and vTPM reports
./build/cocos-cli attestation get snp-vtpm \
  --tee 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890 \
  --vtpm 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890
```

#### Azure Token Attestation

```bash
# Retrieve Azure attestation token
./build/cocos-cli attestation get azure-token \
  --token 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890

# Get Azure token in JWT format
./build/cocos-cli attestation get azure-token \
  --token 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890 \
  --azurejwt
```

#### TDX Attestation

```bash
# Retrieve TDX attestation report
./build/cocos-cli attestation get tdx \
  --tee 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

### Getting Help for Attestation

#### Command Help

```bash
# Get help for the get command
./build/cocos-cli attestation get --help
./build/cocos-cli attestation get -h
```

#### Verbose Output

```bash
# Enable verbose output for any command
./build/cocos-cli attestation get snp --tee <nonce> --verbose
./build/cocos-cli attestation get snp --tee <nonce> -v
```

### Output Format Options

#### Text Protocol Format

```bash
# Get attestation in textproto format (human-readable)
./build/cocos-cli attestation get vtpm --vtpm <nonce> --reporttextproto
```

#### JWT Format (Azure only)

```bash
# Get Azure token as JWT instead of JSON
./build/cocos-cli attestation get azure-token --token <nonce> --azurejwt
```

### Workflow Examples

#### Complete SEV-SNP Workflow

1. **Generate nonce:** Create a 512-bit (64-byte) hex-encoded nonce
2. **Retrieve attestation:**
   `cocos-cli attestation get snp --tee <nonce>`
3. **Verify output:** Check that attestation file is created successfully
4. **Process result:** Use the saved attestation for verification

#### vTPM Verification Workflow

1. **Prepare nonce:** Create a 256-bit (32-byte) hex-encoded nonce
2. **Get report:**
   `cocos-cli attestation get vtpm --vtmp <nonce> --reporttextproto`
3. **Review report:** Examine the textproto formatted output
4. **Validate:** Process the attestation data for verification

### Environment Variable Configuration for Attestation

The CLI supports environment variables for configuration and can be used to
store generated nonces and other parameters for convenience.

### Nonce Generation and Storage

#### Generating Hex Nonces

You can generate cryptographically secure nonces using standard Unix tools
and store them in environment variables:

```bash
# Generate 256-bit (32-byte) nonce for vTPM/Azure token
nonce=$(head -c 32 /dev/urandom | xxd -p)
echo "Generated vTPM nonce: $nonce"

# Generate 512-bit (64-byte) nonce for TEE (SNP/TDX)
tee_nonce=$(head -c 64 /dev/urandom | xxd -p)
echo "Generated TEE nonce: $tee_nonce"

# Generate 256-bit nonce for Azure token
token_nonce=$(head -c 32 /dev/urandom | xxd -p)
echo "Generated token nonce: $token_nonce"
```

#### Using Environment Variables in Commands

Once stored in environment variables, you can use them in your attestation
commands:

```bash
# Using environment variables for nonces
./build/cocos-cli attestation get vtpm --vtpm $nonce
./build/cocos-cli attestation get snp --tee $tee_nonce
./build/cocos-cli attestation get azure-token --token $token_nonce
./build/cocos-cli attestation get snp-vtpm --tee $tee_nonce --vtpm $nonce
```

#### Complete Workflow Example

```bash
# Generate all required nonces
export VTPM_NONCE=$(head -c 32 /dev/urandom | xxd -p)
export TEE_NONCE=$(head -c 64 /dev/urandom | xxd -p)
export TOKEN_NONCE=$(head -c 32 /dev/urandom | xxd -p)

# Use in commands
./build/cocos-cli attestation get vtpm --vtpm $VTMP_NONCE --verbose
./build/cocos-cli attestation get snp --tee $TEE_NONCE --reporttextproto
./build/cocos-cli attestation get azure-token --token $TOKEN_NONCE --azurejwt
```

### Alternative Nonce Generation Methods

#### Using OpenSSL

```bash
# 256-bit nonce using OpenSSL
nonce=$(openssl rand -hex 32)

# 512-bit nonce using OpenSSL
tee_nonce=$(openssl rand -hex 64)
```

#### Using /dev/random (more secure but slower)

```bash
# For high-security environments
nonce=$(head -c 32 /dev/random | xxd -p)
```

### Default Output Files

- Standard attestation: `attestation.bin` (or configured path)
- Azure attestation: `azure_attest_result.bin`
- Text protocol format: `attestation_report.json`
- Azure JWT token: `azure_attest_token.jwt`

### Subcommand: `attestation validate`

The Attestation Validate CLI (`cocos-cli attestation validate`) provides
comprehensive validation and verification of attestation reports from various
Trusted Execution Environment (TEE) technologies. It supports multiple cloud
providers and validation modes with extensive configuration options.

```bash
cocos-cli attestation validate <attestationreportfilepath> [flags]
```

**Description:** Validate and verify attestation information

**Arguments:**

- `<attestationreportfilepath>` (required): Path to the attestation report
  file to validate

**Error Handling:**

- Command requires exactly 1 argument (the attestation report file path)
- Missing file path shows: `please pass the attestation report file path`

### Cloud Providers and Validation Modes

#### Cloud Providers

- `none` (default) - No specific cloud provider (Uses Cocos local server).
- `azure` - Microsoft Azure cloud provider
- `gcp` - Google Cloud Platform provider

#### Validation Modes

- `snp` (default) - SEV-SNP attestation validation
- `vtpm` - vTPM attestation validation
- `snp-vtpm` - Combined SEV-SNP and vTPM validation
- `tdx` - Intel TDX attestation validation

### Command-Line Options and Parameters for Validation

#### Core Configuration Flags

| Flag        | Type    | Default | Description                               |
| ----------- | ------- | ------- | ----------------------------------------- |
| `--cloud`   | string  | `none`  | Confidential computing cloud provider     |
| `--mode`    | string  | `snp`   | Attestation validation mode               |
| `--config`  | string  |         | Path to serialized JSON check.Config file |
| `--help/-h` | boolean |         | Show help for validate command            |

#### Required Flags by Mode

##### SNP Mode Requirements

- `--report_data` (required) - Expected REPORT_DATA field as 64-byte hex
  string
- `--product` (required) - AMD product name for the chip

##### vTPM Mode Requirements

- `--nonce` (required) - Hex encoded nonce for vTPM attestation
- `--format` (required) - Output file format (`binarypb` or `textproto`)
- `--output` (required) - Output file path

##### SNP-vTPM Mode Requirements

- `--report_data` (required) - Expected REPORT_DATA field as 64-byte hex
  string
- `--product` (required) - AMD product name for the chip
- `--nonce` (required) - Hex encoded nonce for vTPM attestation
- `--format` (required) - Output file format (`binarypb` or `textproto`)
- `--output` (required) - Output file path

##### TDX Mode Requirements

- `--report_data` (required) - Expected REPORT_DATA field as 64-byte hex
  string

#### Common Validation Flags

| Flag            | Type     | Default       | Description                            |
| --------------- | -------- | ------------- | -------------------------------------- |
| `--report_data` | bytesHex | 64 zero bytes | Expected REPORT_DATA field (64 bytes)  |
| `--nonce`       | bytesHex |               | Hex encoded nonce for vTPM             |
| `--format`      | string   | `binarypb`    | Output format (`binarypb`/`textproto`) |
| `--output`      | string   |               | Output file path                       |
| `--product`     | string   |               | AMD product name for attestation chip  |

#### SEV-SNP Specific Flags

| Flag                   | Type     | Default       | Description                           |
| ---------------------- | -------- | ------------- | ------------------------------------- |
| `--measurement`        | bytesHex |               | Expected MEASUREMENT field (48 bytes) |
| `--host_data`          | bytesHex | 32 zero bytes | Expected HOST_DATA field (32 bytes)   |
| `--family_id`          | bytesHex | 16 zero bytes | Expected FAMILY_ID field (16 bytes)   |
| `--image_id`           | bytesHex | 16 zero bytes | Expected IMAGE_ID field (16 bytes)    |
| `--guest_policy`       | uint     | 196608        | Most acceptable guest SnpPolicy       |
| `--minimum_guest_svn`  | uint32   |               | Most acceptable GUEST_SVN             |
| `--minimum_tcb`        | uint     |               | Minimum CURRENT_TCB, COMMITTED_TCB    |
| `--minimum_lauch_tcb`  | uint     |               | Minimum LAUNCH_TCB value              |
| `--minimum_build`      | uint32   |               | 8-bit minimum AMD-SP firmware build   |
| `--minimum_version`    | string   | `0.0`         | Minimum AMD-SP firmware API version   |
| `--platform_info`      | string   |               | Maximum PLATFORM_INFO field (64-bit)  |
| `--require_author_key` | boolean  |               | Require AUTHOR_KEY_EN is 1            |
| `--require_id_block`   | boolean  |               | Require VM launched with signed ID    |

#### Certificate and Trust Flags

| Flag                          | Type        | Default | Description                                    |
| ----------------------------- | ----------- | ------- | ---------------------------------------------- |
| `--CA_bundles`                | stringArray |         | PEM format CA bundles for AMD product          |
| `--CA_bundles_paths`          | stringArray |         | Paths to CA bundles (ASK, ARK certificates)    |
| `--check_crl`                 | boolean     |         | Download and check CRL for revoked certs       |
| `--trusted_author_keys`       | stringArray |         | Paths to x.509 certificates of trusted keys    |
| `--trusted_author_key_hashes` | stringArray |         | SHA-384 hash values of trusted author keys     |
| `--trusted_id_keys`           | stringArray |         | Paths to x.509 certificates of trusted ID keys |
| `--trusted_id_key_hashes`     | stringArray |         | SHA-384 hash values of trusted identity keys   |

#### TDX Specific Flags

| Flag                    | Type     | Default | Description                                |
| ----------------------- | -------- | ------- | ------------------------------------------ |
| `--mr_td`               | bytesHex |         | Expected MR_TD field (48 bytes)            |
| `--mr_config_id`        | bytesHex |         | Expected MR_CONFIG_ID field (48 bytes)     |
| `--mr_config_owner`     | bytesHex |         | Expected MR_OWNER_CONFIG field (48 bytes)  |
| `--mr_owner`            | bytesHex |         | Expected MR_OWNER field (48 bytes)         |
| `--mr_seam`             | bytesHex |         | Expected MR_SEAM field (48 bytes)          |
| `--td_attributes`       | bytesHex |         | Expected TD_ATTRIBUTES field (8 bytes)     |
| `--xfam`                | bytesHex |         | Expected XFAM field (8 bytes)              |
| `--rtmrs`               | string   |         | Comma-separated hex for RTMRS (4x48 bytes) |
| `--minimum_tee_tcb_svn` | bytesHex |         | Minimum TEE_TCB_SVN field (16 bytes)       |
| `--minimum_pce_svn`     | uint32   |         | Minimum PCE_SVN field value                |
| `--minimum_qe_svn`      | uint32   |         | Minimum QE_SVN field value                 |
| `--qe_vendor_id`        | bytesHex |         | Expected QE_VENDOR_ID field (16 bytes)     |
| `--trusted_root`        | string   |         | Paths to CA bundles for Intel TDX (PEM)    |

#### Network and Retry Configuration

| Flag                | Type     | Default | Description                               |
| ------------------- | -------- | ------- | ----------------------------------------- |
| `--get_collateral`  | boolean  |         | Download necessary collaterals for checks |
| `--timeout`         | duration | `2m0s`  | Duration to retry failed HTTP requests    |
| `--max_retry_delay` | duration | `30s`   | Maximum duration between HTTP retries     |

#### Report ID and Additional Fields

| Flag             | Type     | Default       | Description                            |
| ---------------- | -------- | ------------- | -------------------------------------- |
| `--report_id`    | bytesHex |               | Expected REPORT_ID field (32 bytes)    |
| `--report_id_ma` | bytesHex | 32 0xFF bytes | Expected REPORT_ID_MA field (32 bytes) |
| `--chip_id`      | bytesHex |               | Expected CHIP_ID field (48 bytes)      |
| `--stepping`     | string   |               | Machine stepping for attestation chip  |

#### Global Flags for Validation

| Flag        | Short | Type    | Description           |
| ----------- | ----- | ------- | --------------------- |
| `--verbose` | `-v`  | boolean | Enable verbose output |

### Usage Patterns and Workflows for Validation

#### Basic Usage Examples for `validate`

##### Default SNP Validation

```bash
# Basic SEV-SNP validation (default mode)
./build/cocos-cli attestation validate attestation.bin \
  --report_data 1a2b3c4d... \
  --product "Milan"
```

##### SNP Mode with Explicit Configuration

```bash
# SEV-SNP validation with explicit mode
./build/cocos-cli attestation validate --mode snp attestation.bin \
  --report_data 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890 \
  --product "Milan" \
  --measurement 8a9b0c1d2e3f4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12
```

##### vTPM Validation

```bash
# vTPM attestation validation
./build/cocos-cli attestation validate --mode vtpm attestation.bin \
  --nonce 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890 \
  --format textproto \
  --output vtpm_result.txt
```

##### Combined SNP-vTPM Validation

```bash
# Combined SEV-SNP and vTPM validation
./build/cocos-cli attestation validate --mode snp-vtpm attestation.bin \
  --report_data 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890 \
  --product "Milan" \
  --nonce 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890 \
  --format binarypb \
  --output combined_result.bin
```

##### TDX Validation

```bash
# Intel TDX attestation validation
./build/cocos-cli attestation validate --mode tdx attestation.bin \
  --report_data 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

#### Cloud Provider Examples

##### Azure Cloud Validation

```bash
# Azure vTPM validation
./build/cocos-cli attestation validate --cloud azure --mode vtpm attestation.bin \
  --nonce 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890 \
  --format textproto \
  --output azure_result.txt
```

##### GCP Cloud Validation

```bash
# GCP combined SNP-vTPM validation
./build/cocos-cli attestation validate --cloud gcp --mode snp-vtpm attestation.bin \
  --report_data 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890 \
  --product "Milan" \
  --nonce 1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890 \
  --format binarypb \
  --output gcp_result.bin
```

#### Advanced Configuration Examples

##### With Custom Certificate Authority

```bash
# SNP validation with custom CA bundles
./build/cocos-cli attestation validate --mode snp attestation.bin \
  --report_data 1a2b... --product "Milan" \
  --CA_bundles_paths /path/to/ask.pem,/path/to/ark.pem \
  --check_crl \
  --trusted_author_keys /path/to/author.crt
```

##### With Comprehensive TDX Configuration

```bash
# TDX validation with multiple measurement fields
./build/cocos-cli attestation validate --mode tdx attestation.bin \
  --report_data 1a2b3c4d... \
  --mr_td 8a9b0c1d2e3f4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12 \
  --mr_config_id 7f8e9d0c1b2a3948567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab \
  --td_attributes 0123456789abcdef \
  --minimum_pce_svn 8 \
  --minimum_qe_svn 12
```

### Environment Variable Configuration

#### Nonce and Report Data Generation

```bash
# Generate required hex values for validation
REPORT_DATA=$(head -c 64 /dev/urandom | xxd -p)
VTPM_NONCE=$(head -c 32 /dev/urandom | xxd -p)
MEASUREMENT=$(head -c 48 /dev/urandom | xxd -p)

# Store in environment variables
export COCOS_REPORT_DATA=$REPORT_DATA
export COCOS_VTPM_NONCE=$VTMP_NONCE
export COCOS_MEASUREMENT=$MEASUREMENT

# Use in validation commands
./build/cocos-cli attestation validate --mode snp attestation.bin \
  --report_data $COCOS_REPORT_DATA \
  --product "Milan" \
  --measurement $COCOS_MEASUREMENT
```

#### Configuration File Generation

```bash
# Generate JSON configuration for complex setups
cat > validation_config.json << EOF
{
  "rootOfTrust": {
    "product": "Milan",
    "cabundlePaths": ["/path/to/ask.pem", "/path/to/ark.pem"],
    "checkCrl": true,
    "disallowNetwork": false
  },
  "policy": {
    "minimumGuestSvn": 1,
    "reportData": "$(echo $COCOS_REPORT_DATA | base64 -w 0)",
    "measurement": "$(echo $COCOS_MEASUREMENT | base64 -w 0)",
    "minimumVersion": "1.51",
    "requireAuthorKey": true
  }
}
EOF

# Use configuration file
./build/cocos-cli attestation validate attestation.bin --config validation_config.json
```

#### Typical Environment Variables

```bash
# Default file paths
export COCOS_CA_BUNDLE_PATH="/etc/cocos/ca-bundles"
export COCOS_TRUSTED_CERTS_PATH="/etc/cocos/trusted-certs"
export COCOS_OUTPUT_DIR="/tmp/cocos-validation"

# Network configuration
export COCOS_HTTP_TIMEOUT="5m0s"
export COCOS_MAX_RETRY_DELAY="1m0s"
export COCOS_ALLOW_NETWORK_COLLATERAL="true"

# Default validation parameters
export COCOS_DEFAULT_CLOUD="none"
export COCOS_DEFAULT_MODE="snp"
export COCOS_DEFAULT_FORMAT="textproto"
```

#### JSON Configuration File Format

The `--config` flag accepts a comprehensive JSON configuration file. Here's the structure:

```json
{
  "rootOfTrust": {
    "product": "Milan",
    "cabundlePaths": ["path/to/ask.pem", "path/to/ark.pem"],
    "cabundles": ["PEM_CONTENT_1", "PEM_CONTENT_2"],
    "checkCrl": true,
    "disallowNetwork": false
  },
  "policy": {
    "minimumGuestSvn": 1,
    "policy": "196608",
    "familyId": "base64_encoded_16_bytes",
    "imageId": "base64_encoded_16_bytes",
    "vmpl": 0,
    "minimumTcb": "1",
    "minimumLaunchTcb": "1",
    "platformInfo": "0",
    "requireAuthorKey": true,
    "reportData": "base64_encoded_64_bytes",
    "measurement": "base64_encoded_48_bytes",
    "hostData": "base64_encoded_32_bytes",
    "reportId": "base64_encoded_32_bytes",
    "reportIdMa": "base64_encoded_32_bytes",
    "chipId": "base64_encoded_48_bytes",
    "minimumBuild": 1,
    "minimumVersion": "1.51",
    "permitProvisionalFirmware": true,
    "requireIdBlock": true,
    "trustedAuthorKeys": ["base64_key_1", "base64_key_2"],
    "trustedAuthorKeyHashes": ["base64_hash_1", "base64_hash_2"],
    "trustedIdKeys": ["base64_key_1", "base64_key_2"],
    "trustedIdKeyHashes": ["base64_hash_1", "base64_hash_2"],
    "product": {
      "name": 1,
      "stepping": 1,
      "machineStepping": 1
    }
  }
}
```

## Command: `ca-bundle`

Fetch AMD SEV-SNPs CA Bundle (ASK and ARK)

**Usage:**

```bash
cocos-cli ca-bundle [flags]
```

**Arguments:**

- `<path_to_platform_info_json>`: Path to the platform info JSON file

**Flags:**

- `-h, --help`: Help for ca-bundle

**Global Flags:**

- `-v, --verbose`: Enable verbose output

**Dataset Types:**

The CLI supports both files and directories as datasets:

1. **Single Files:**

   ```bash
   ./build/cocos-cli data dataset.csv private_key.pem
   ```

2. **Directories** (automatically zipped):

   ```bash
   ./build/cocos-cli data /path/to/dataset/ private_key.pem
   ```

**Compression:**

Use the `-d, --decompress` flag to automatically decompress datasets on the agent:

```bash
./build/cocos-cli data dataset.zip private_key.pem --decompress
```

**Authentication:**

Dataset uploads require digital signature authentication using the same key formats supported for algorithms (RSA, ECDSA, Ed25519 in PEM format).

**File Processing:**

- Directories are automatically compressed into ZIP format before upload
- Large datasets are handled using streaming upload
- Temporary files are automatically cleaned up after upload
- File integrity is verified during the upload process

**Example:**

```bash
./build/cocos-cli ca-bundle <path_to_platform_info_json>
```

## Command: `checksum`

Compute the sha3-256 hash of a file

**Usage:**

```bash
cocos-cli checksum [flags]
```

**Arguments:**

- `<file>`: Path to the file to compute hash for

**Flags:**

- `-b, --base64`: Output the hash in base64
- `-h, --help`: Help for checksum
- `-m, --manifest`: Compute the hash of the manifest file

**Global Flags:**

- `-v, --verbose`: Enable verbose output

**Checksum Types:**

1. **Standard File Checksum:**

   ```bash
   ./build/cocos-cli checksum data.txt
   # Output: SHA3-256 hash in hexadecimal format
   ```

2. **Manifest File Checksum** (`-m, --manifest`):

   ```bash
   ./build/cocos-cli checksum -m computation.json
   # Processes JSON manifest format for computation verification
   ```

3. **Base64 Output** (`-b, --base64`):

   ```bash
   ./build/cocos-cli checksum -b data.txt
   # Output: SHA3-256 hash in base64 format
   ```

**Manifest File Format:**

When using the `--manifest` flag, the CLI expects a JSON file with a specific computation manifest format. This is used for verifying the integrity of computation configurations.

**Hash Algorithm:**

The CLI uses SHA3-256 (Keccak-256) for all hash calculations, providing:

- 256-bit security level
- Resistance to length extension attacks
- Cryptographic security suitable for attestation

**Use Cases:**

- Verifying file integrity before upload
- Computing expected measurements for attestation
- Generating checksums for manifest verification
- Creating hash-based identifiers for files

**Examples:**

```bash
# Basic file checksum
./build/cocos-cli checksum dataset.csv

# Manifest checksum in base64
./build/cocos-cli checksum -m -b computation_manifest.json

# Standard file checksum in base64
./build/cocos-cli checksum -b algorithm.bin
```

## Command: `completion`

> **Note:** Completion commands are documented but rely on Cobra's built-in completion functionality which may not be explicitly implemented in the current codebase.

Generate the autocompletion script for cocos-cli for the specified shell.
See each sub-command's help for details on how to use the generated script.

**Usage:**

```bash
cocos-cli completion [command]
```

**Available Commands:**

- `bash`: Generate the autocompletion script for bash
- `fish`: Generate the autocompletion script for fish
- `powershell`: Generate the autocompletion script for powershell
- `zsh`: Generate the autocompletion script for zsh

**Flags:**

- `-h, --help`: Help for completion

**Global Flags:**

- `-v, --verbose`: Enable verbose output

### Subcommand: `completion bash`

Generate the autocompletion script for the bash shell.

This script depends on the 'bash-completion' package.
If it is not installed already, you can install it via your OS's package manager.

**Usage:**

```bash
cocos-cli completion bash
```

**Flags:**

- `-h, --help`: Help for bash
- `--no-descriptions`: Disable completion descriptions

#### Setup Instructions for Bash

**Load completions in your current shell session:**

```bash
source <(cocos-cli completion bash)
```

**Load completions for every new session (execute once):**

Linux:

```bash
./build/cocos-cli completion bash > /etc/bash_completion.d/cocos-cli
```

macOS:

```bash
./build/cocos-cli completion bash > $(brew --prefix)/etc/bash_completion.d/cocos-cli
```

You will need to start a new shell for this setup to take effect.

### Subcommand: `completion fish`

Generate the autocompletion script for the fish shell.

**Usage:**

```bash
cocos-cli completion fish [flags]
```

**Flags:**

- `-h, --help`: Help for fish
- `--no-descriptions`: Disable completion descriptions

#### Setup Instructions for Fish

**Load completions in your current shell session:**

```bash
./build/cocos-cli completion fish | source
```

**Load completions for every new session (execute once):**

```bash
./build/cocos-cli completion fish > ~/.config/fish/completions/cocos-cli.fish
```

You will need to start a new shell for this setup to take effect.

### Subcommand: `completion powershell`

Generate the autocompletion script for powershell.

**Usage:**

```bash
cocos-cli completion powershell [flags]
```

**Flags:**

- `-h, --help`: Help for powershell
- `--no-descriptions`: Disable completion descriptions

#### Setup Instructions for PowerShell

**Load completions in your current shell session:**

```powershell
./build/cocos-cli completion powershell | Out-String | Invoke-Expression
```

**Load completions for every new session:**
Add the output of the above command to your powershell profile.

### Subcommand: `completion zsh`

Generate the autocompletion script for the zsh shell.

If shell completion is not already enabled in your environment you will need
to enable it. You can execute the following once:

```bash
echo "autoload -U compinit; compinit" >> ~/.zshrc
```

**Usage:**

```bash
cocos-cli completion zsh [flags]
```

**Flags:**

- `-h, --help`: Help for zsh
- `--no-descriptions`: Disable completion descriptions

#### Setup Instructions for Zsh

**Load completions in your current shell session:**

```bash
source <(./build/cocos-cli completion zsh)
```

**Load completions for every new session (execute once):**

##### Linux

```bash
./build/cocos-cli completion zsh > "${fpath[1]}/_cocos-cli"
```

##### macOS

```bash
./build/cocos-cli completion zsh > $(brew --prefix)/share/zsh/site-functions/_cocos-cli
```

You will need to start a new shell for this setup to take effect.

## Command: `create-vm`

Create a new virtual machine

**Usage:**

```bash
cocos-cli create-vm [flags]
```

**Arguments:**
None

**Flags:**

- `--<empty> string`: CVM CA service URL
- `--client-crt string`: CVM client crt
- `--client-key string`: CVM client key
- `-h, --help`: Help for create-vm
- `--log-level string`: Agent Log level
- `--server-ca string`: CVM server CA
- `--server-url string`: CVM server URL
- `--ttl duration`: TTL for the VM

**Global Flags:**

- `-v, --verbose`: Enable verbose output

**Required Configuration:**

VM creation requires connection to the Manager service. Set the manager URL:

```bash
export MANAGER_GRPC_URL=manager.example.com:50051
```

**Certificate Configuration:**

For secure connections, configure TLS/mTLS certificates:

```bash
# For TLS
export MANAGER_GRPC_SERVER_CA_CERTS=/path/to/manager-ca.pem

# For mTLS (mutual TLS)
export MANAGER_GRPC_CLIENT_CERT=/path/to/client.crt
export MANAGER_GRPC_CLIENT_KEY=/path/to/client.key
```

**VM Configuration Options:**

- `--server-url`: CVM server URL (overrides environment variable)
- `--server-ca`: CVM server CA certificate path
- `--client-key`: Client private key for mTLS authentication
- `--client-crt`: Client certificate for mTLS authentication
- `--ca-url`: CA service URL for certificate management
- `--log-level`: Agent log level (info, debug, warn, error)
- `--ttl`: VM time-to-live duration (e.g., "24h", "7d")

**VM Lifecycle:**

The CLI creates a confidential virtual machine with:

1. Secure boot and attestation capabilities
2. Agent service automatically deployed
3. Network connectivity for algorithm/data upload
4. Automatic cleanup based on TTL settings

**Output:**

Successful VM creation returns:

- VM identifier (CVM ID) for future reference
- Agent service endpoint for data operations
- Connection details for attestation

**Examples:**

```bash
# Basic VM creation
./build/cocos-cli create-vm --server-url https://manager.example.com

# VM with custom TTL and log level
./build/cocos-cli create-vm \
  --server-url https://manager.example.com \
  --ttl 48h \
  --log-level debug

# VM with mTLS authentication
./build/cocos-cli create-vm \
  --server-url https://manager.example.com \
  --client-cert /path/to/client.crt \
  --client-key /path/to/client.key \
  --server-ca /path/to/ca.pem
```

## Command: `data`

Upload a dataset

**Usage:**

```bash
cocos-cli data [flags]
```

**Arguments:**

- `<dataset_path>`: Path to the dataset file
- `<private_key_file_path>`: Path to the private key file

**Flags:**

- `-d, --decompress`: Decompress the dataset on agent
- `-h, --help`: Help for data

**Global Flags:**

- `-v, --verbose`: Enable verbose output

**Supported Key Types:**

1. **RSA Keys** (`rsa` - default):
    - **Key Size:** 4096 bits
    - **Format:** PKCS#1 PEM encoding
    - **Usage:** Most compatible, widely supported

   ```bash
   ./build/cocos-cli keys -k rsa
   ```

2. **ECDSA Keys** (`ecdsa`):
    - **Curve:** P-256 (secp256r1)
    - **Format:** PKCS#8 PEM encoding
    - **Usage:** Smaller key size, good performance

   ```bash
   ./build/cocos-cli keys -k ecdsa
   ```

3. **Ed25519 Keys** (`ed25519`):
    - **Algorithm:** EdDSA with Curve25519
    - **Format:** PKCS#8 PEM encoding
    - **Usage:** Modern, high-performance elliptic curve

   ```bash
   ./build/cocos-cli keys -k ed25519
   ```

**Generated Files:**

The command creates two files in the current directory:

- `private.pem` - Private key (keep secure!)
- `public.pem` - Public key (safe to share)

**File Permissions:**

The CLI automatically sets appropriate permissions:

- Private key: `600` (read/write for owner only)
- Public key: `644` (readable by all, writable by owner)

**Key Usage:**

Generated keys can be used for:

- Algorithm upload authentication
- Dataset upload authentication
- Result retrieval authentication
- Any operation requiring digital signatures in COCOS

**Example:**

```bash
./build/cocos-cli data <dataset_path> <private_key_file_path>
```

The agent grpc url is required for this operation, this will be available once the TEE has been provisioned and agent is running.

## Command: `igvmmeasure`

igvmmeasure measures an IGVM file and outputs the calculated measurement.
It ensures integrity verification for the IGVM file.

We assume that our current working directory is the root of the cocos repository, both on the host machine and in the VM.

`igvmmeasure` calculates the launch measurement for an IGVM file and can generate a signed version. It ensures integrity by precomputing the expected launch digest, which can be verified against the attestation report. The tool parses IGVM directives, outputs the measurement as a hex string, or creates a signed file for verification at guest launch.

**Usage:**

```bash
cocos-cli igvmmeasure <INPUT> [flags]
```

**Arguments:**

- `<INPUT>`: Path to the IGVM file to measure

**Flags:**

- `-h, --help`: Help for igvmmeasure

**Global Flags:**

- `-v, --verbose`: Enable verbose output

The tool will parse the directives in the IGVM file, calculate the launch measurement, and output the computed digest. If successful, it prints the measurement to standard output.

**IGVM File Format:**

IGVM (Isolated Guest Virtual Machine) files contain:

- VM configuration directives
- Initial memory layout
- Boot loader and kernel images
- Security policy settings
- Measurement targets for attestation

**Measurement Calculation:**

The tool processes IGVM directives to calculate the launch measurement by:

1. Parsing all IGVM directives in order
2. Processing memory layout and content directives
3. Calculating cumulative hash of measured components
4. Outputting final measurement as hex string

**Use Cases:**

- **Pre-launch Verification:** Calculate expected measurement before VM launch
- **Attestation Policy:** Use measurement in attestation policies
- **Integrity Verification:** Verify IGVM file hasn't been tampered with
- **Policy Creation:** Generate policies based on measured values

**Integration with Attestation:**

The calculated measurement can be used with attestation validation:

```bash
# Calculate IGVM measurement
measurement=$(./build/cocos-cli igvmmeasure vm.igvm)

# Use in attestation validation
./build/cocos-cli attestation validate attestation.bin \
  --measurement $measurement \
  --mode snp
```

**Error Handling:**

Common errors include:

- Invalid IGVM file format
- Corrupted or incomplete IGVM file
- Unsupported IGVM directives
- File permission issues

Here is a sample output:

```text
91c4929bec2d0ecf11a708e09f0a57d7d82208bcba2451564444a4b01c22d047995ca27f9053f86de4e8063e9f810548
```

**Output Format:**

The measurement is output as a 384-bit (48-byte) hex-encoded string, suitable for:

- Direct use in attestation policies
- Comparison with attestation report measurements
- Storage in configuration files
- Integration with automated verification scripts

## Command: `ima-measurements`

Retrieve Linux IMA measurements file.

The Linux VM, which is used has, has [IMA](https://ima-doc.readthedocs.io/en/latest/ima-concepts.html) enabled.
During the boot process every file is measured.
Users can download these measurements with the `ima-measurements` command.

The file is verified using the TPM PCR10 SHA1 value.
Measurements of each file must be verified by user since we can't control everything that goes in the image.

**Usage:**

```bash
cocos-cli ima-measurements [flags]
```

**Arguments:**

- `<optional_file_name>`: Optional filename to save the measurements file (default filename used if not provided)

**Flags:**

- `-h, --help`: Help for ima-measurements

**Global Flags:**

- `-v, --verbose`: Enable verbose output

**IMA Overview:**

Integrity Measurement Architecture (IMA) is a Linux kernel subsystem that maintains a runtime measurement list of all files accessed by the system. The COCOS VM has IMA enabled to provide a complete boot and runtime integrity log.

**Measurement Process:**

1. **Boot Measurements:** Every file accessed during boot is measured
2. **Runtime Measurements:** Continued measurement of accessed files
3. **PCR Extension:** Measurements extend TPM Platform Configuration Register 10 (PCR10)
4. **Verification:** Downloaded measurements can be verified against PCR10 value

**PCR10 Verification:**

The CLI automatically performs PCR10 verification:

```bash
# The CLI calculates the expected PCR10 value from measurements
# and compares it with the actual TPM PCR10 value
./build/cocos-cli ima-measurements measurements.log
```

**Measurement File Format:**

The downloaded file contains IMA measurement entries in the format:

```text
<PCR> <template_hash> <template_name> <file_hash> <file_path>
```

Example entry:

```text
10 sha1:a4c5d8ea9b982... ima-ng sha256:b7f6c1d2e8f9... /usr/bin/python3
```

**Verification Process:**

1. Download measurements from the agent
2. Parse each measurement entry
3. Reconstruct PCR10 by extending each measurement
4. Compare calculated PCR10 with actual TPM value
5. Report verification status

**Use Cases:**

- **Attestation:** Verify VM integrity before trusting computation results
- **Audit:** Review all files accessed during computation
- **Compliance:** Maintain detailed access logs for security compliance
- **Debugging:** Identify unexpected file accesses or modifications

**Security Considerations:**

- Measurements cannot be forged due to TPM hardware protection
- PCR10 verification ensures measurement file integrity
- Users must verify individual file measurements for complete assurance
- Unexpected measurements may indicate compromise or misconfiguration

**Examples:**

```bash
# Download with default filename
./build/cocos-cli ima-measurements

# Download with custom filename
./build/cocos-cli ima-measurements custom_measurements.log

# Download with verbose verification output
./build/cocos-cli ima-measurements measurements.log --verbose
```

## Command: `keys`

Generates a new public/private key pair using an algorithm of the users choice.
Supported algorithms are RSA, ecdsa, and ed25519.

**Usage:**

```bash
cocos-cli keys [flags]
```

**Arguments:**
None

**Flags:**

- `-h, --help`: Help for keys
- `-k, --key-type string`: User Key type (default "rsa")

**Global Flags:**

- `-v, --verbose`: Enable verbose output

**Example:**

```bash
./build/cocos-cli keys -k rsa
```

This will generate a key pair of type rsa. Different key types can be generated using the `-k` flag. Currently supported types on cocos are rsa, ecdsa and ed25519.

## Command: `policy`

Change attestation policy

**Usage:**

```bash
cocos-cli policy [command] [flags]
cocos-cli policy [command]
```

**Available Commands:**

- `azure`: Get attestation policy for Azure CVM
- `download`: Download GCP OVMF file
- `gcp`: Get attestation policy for GCP CVM
- `hostdata`: Add host data to the attestation policy file. The value should be in base64. The second parameter is attestation_policy.json file
- `measurement`: Add measurement to the attestation policy file. The value should be in base64. The second parameter is attestation_policy.json file

**Flags:**

- `-h, --help`: Help for policy

**Global Flags:**

- `-v, --verbose`: Enable verbose output

### Subcommand: `policy measurement`

Add measurement to the attestation policy file. The value should be in base64. The second parameter is attestation_policy.json file

**Usage:**

```bash
cocos-cli policy measurement [flags]
```

**Arguments:**

- `<measurement>`: Measurement value in base64
- `<attestation_policy.json>`: Path to attestation policy JSON file

**Example:**

```bash
./build/cocos-cli measurement <measurement> <attestation_policy.json>
```

### Subcommand: `policy hostdata`

Add host data to the attestation policy file. The value should be in base64. The second parameter is attestation_policy.json file

**Usage:**

```bash
cocos-cli policy hostdata [flags]
```

**Arguments:**

- `<host-data>`: Host data value in base64
- `<attestation_policy.json>`: Path to attestation policy JSON file

**Example:**

```bash
./build/cocos-cli hostdata <host-data> <attestation_policy.json>
```

### Subcommand: `policy gcp`

Get attestation policy for GCP CVM

**Usage:**

```bash
cocos-cli policy gcp [flags]
```

**Arguments:**

- `<bin_vtmp_attestation_report_file>`: Path to binary vTMP attestation report file
- `<vcpu_count>`: Number of vCPUs

**Example:**

```bash
./build/cocos-cli policy gcp <bin_vtmp_attestation_report_file> <vcpu_count>
```

### Subcommand: `policy download`

Download GCP OVMF file

**Usage:**

```bash
cocos-cli policy download [flags]
```

**Arguments:**

- `<bin_vtmp_attestation_report_file>`: Path to binary vTMP attestation report file

**Example:**

```bash
./build/cocos-cli policy download <bin_vtmp_attestation_report_file>
```

### Subcommand: `policy azure`

Get attestation policy for Azure CVM

**Usage:**

```bash
cocos-cli policy azure [flags]
```

**Arguments:**

- `<azure_maa_token_file>`: Path to Azure MAA token file
- `<product_name>`: Product name

**Flags:**

- `--policy uint64`: Policy of the guest CVM

**Example:**

```bash
./build/cocos-cli policy azure <azure_maa_token_file> <product_name>
```

### Subcommand: `policy extend`

Extends the attestation policies PCR16 register with the hashes of downloaded compute manifests.

> **Note:** This command is documented but not currently implemented in the codebase. It may be available in future versions.

**Planned Usage:**

```bash
cocos-cli policy extend
```

**Planned Arguments:**

- `<attestation_policy_file_path>`: Path to attestation policy file
- `<compute_manifest_file_path0> <compute_manifest_file_path1> ...`: Paths to compute manifest files

**Planned Functionality:**

This command would:

1. Read the attestation policy file
2. Calculate SHA-256 hashes of each compute manifest file
3. Extend PCR16 with the calculated hashes in order
4. Update the attestation policy with new PCR16 expected value

**Example:**

```bash
./build/cocos-cli policy extend <attestation_policy_file_path> <compute_manifest_file_path0> <compute_manifest_file_path1> ...
```

## Command: `remove-vm`

Remove a virtual machine

**Usage:**

```bash
cocos-cli remove-vm [flags]
```

**Arguments:**

- `<cvm_id>`: The unique identifier of the virtual machine to remove

**Flags:**

- `-h, --help`: help for remove-vm
- `-v, --verbose`: Enable verbose output

**VM Removal Process:**

Removing a VM performs the following operations:

1. Stops all running computations
2. Clears sensitive data from memory
3. Destroys the confidential VM instance
4. Releases allocated resources
5. Removes network configurations

**Required Information:**

You need the CVM ID that was returned when the VM was created. This is a unique identifier for the virtual machine instance.

**Manager Service Connection:**

Ensure the Manager service URL is configured:

```bash
export MANAGER_GRPC_URL=manager.example.com:50051
```

**Security Considerations:**

- VM removal is irreversible
- All data and computation state is permanently destroyed
- Ensure results are retrieved before removal
- Authentication may be required for VM removal

**Examples:**

```bash
# Remove VM with specific ID
./build/cocos-cli remove-vm vm-12345678-abcd-efgh-ijkl-123456789012

# Remove VM with verbose output
./build/cocos-cli remove-vm vm-12345678-abcd-efgh-ijkl-123456789012 --verbose
```

**Error Handling:**

Common errors include:

- VM ID not found
- VM already removed
- Insufficient permissions
- Manager service unavailable

## Command: `result`

Retrieve computation result file

**Usage:**

```bash
cocos-cli result [flags]
```

**Arguments:**

- `<private_key_file_path>`: Path to the private key file
- `<optional_file_name.zip>`: Optional output filename for the result (zip format)

**Flags:**

- `-h, --help`: help for result
- `-v, --verbose`: Enable verbose output

**Result File Handling:**

The CLI downloads computation results as ZIP files and handles extraction automatically:

- **Default filename:** `results.zip` if not specified
- **Custom filename:** Use second argument to specify custom output filename
- **Automatic extraction:** Results are extracted to the current directory

**Authentication:**

Result retrieval requires the same private key used for algorithm/dataset upload to verify authorization.

**Download Process:**

1. CLI connects to agent using the private key for authentication
2. Agent verifies authorization and packages results
3. Results are downloaded as a ZIP archive
4. CLI automatically extracts the archive to the current directory
5. Temporary files are cleaned up automatically

**Examples:**

```bash
# Download with default filename
./build/cocos-cli result private_key.pem

# Download with custom filename
./build/cocos-cli result private_key.pem my_results.zip
```

**Output:**

If the result is available and agent is ready to receive the results, the result will be extracted and written to the current directory as `result.bin`.

The agent grpc url is required for this operation, this will be available once the TEE has been provisioned and agent is running.

## Command: `sevsnpmeasure`

Calculate AMD SEV/SEV-ES/SEV-SNP guest launch measurement

**Usage:**

```bash
cocos-cli sevsnpmeasure [flags]
cocos-cli sevsnpmeasure [command]
```

**Available Commands:**

- `parse-metadata`: Show metadata from a OVMF binary

**Flags:**

| Flag               | Short | Type   | Required | Description                                                    | Default |
| ------------------ | ----- | ------ | -------- | -------------------------------------------------------------- | ------- |
| `--mode`           | `-m`  | string | ✓        | Guest mode: 'snp', 'seves', 'sev', 'snp:ovmf-hash', 'snp:svsm' | -       |
| `--ovmf`           | `-o`  | string | ✓        | Path to OVMF binary                                            | -       |
| `--append`         | `-a`  | string |          | Kernel command line arguments                                  | -       |
| `--dump-vmsa`      |       | bool   |          | Write measured VMSAs to vmsa.bin                               | false   |
| `--guest-features` |       | uint   |          | Guest kernel features expected                                 | 1       |
| `--help`           | `-h`  |        |          | Help for sevsnpmeasure                                         | -       |
| `--initrd`         | `-i`  | string |          | Path to initrd binary                                          | -       |
| `--kernel`         | `-k`  | string |          | Path to kernel binary                                          | -       |
| `--snp-ovmf-hash`  |       | string |          | Precalculated hash of OVMF binary (hex)                        | -       |
| `--svsm`           |       | string |          | Path to SVSM binary                                            | -       |
| `--vars-file`      |       | string |          | Path to OVMF_VARS file                                         | -       |
| `--vars-size`      |       | int    |          | Size of OVMF_VARS file in bytes                                | 0       |
| `--vcpu-family`    | `-f`  | int    |          | Guest vCPU family                                              | -       |
| `--vcpu-model`     | `-l`  | int    |          | Guest vCPU model                                               | -       |
| `--vcpu-sig`       | `-s`  | int    |          | Guest vCPU signature                                           | -       |
| `--vcpu-stepping`  | `-p`  | int    |          | Guest vCPU stepping                                            | -       |
| `--vcpu-type`      | `-t`  | string |          | Guest vCPU type                                                | -       |
| `--vcpus`          |       | int    |          | Number of guest vCPUs                                          | 0       |
| `--vmm-type`       |       | string |          | VMM type: 'QEMU' or 'EC2'                                      | "QEMU"  |
| `--verbose`        | `-v`  | bool   |          | Enable verbose output                                          | false   |

**Examples:**

```bash
# Calculate SNP measurement
./build/cocos-cli sevsnpmeasure --mode snp --ovmf /path/to/ovmf.fd --vcpus 4

# Calculate with kernel and initrd
./build/cocos-cli sevsnpmeasure --mode snp --ovmf /path/to/ovmf.fd --kernel /path/to/kernel --initrd /path/to/initrd --vcpus 2

# Calculate OVMF hash only
./build/cocos-cli sevsnpmeasure --mode snp:ovmf-hash --ovmf /path/to/ovmf.fd
```

## Common Error Messages

### Missing Required Arguments

#### Missing Attestation Type

```text
Error: accepts 1 arg(s), received 0
Usage:
  cocos-cli attestation get [flags]
```

**Cause:** No attestation type provided as argument

**Solution:** Specify one of: `snp`, `vtmp`, `snp-vtpm`, `azure-token`, `tdx`

**Example:** `./build/cocos-cli attestation get snp --tee <nonce>`

#### Missing File Path

```text
please pass the attestation report file path
```

**Cause:** No attestation report file path provided as argument

**Solution:** Provide the path to the attestation report file

**Example:** `cocos-cli attestation validate /path/to/attestation.bin --mode snp ...`

### Missing Required Flags

```text
failed to mark 'report_data' as required for SEV-snp mode: <error>
failed to mark 'product' as required: <error>
failed to mark 'nonce' as required for vtpm mode: <error>
failed to mark 'format' as required for vtpm mode: <error>
failed to mark 'output' as required for vtpm mode: <error>
```

**Cause:** Required flags not provided for the selected validation mode

**Solution:** Provide all required flags for the chosen mode (see Required Flags by Mode section)

### Invalid Configuration Errors

#### Unknown Mode Error

```text
unknown mode: <invalid_mode>
```

**Cause:** Invalid validation mode specified

**Solution:** Use one of: `snp`, `vtpm`, `snp-vtpm`, `tdx`

#### Invalid Attestation Type

```text
Bad attestation type: <error details>
```

**Cause:** Provided attestation type is not supported

**Solution:** Use one of: `snp`, `vtpm`, `snp-vtpm`, `azure-token`, `tdx`

### Nonce-Related Errors

#### Missing Required Nonce

```text
vTPM nonce must be defined for vTPM attestation
TEE nonce must be defined for SEV-SNP attestation
Token nonce must be defined for Azure attestation
```

**Cause:** Required nonce parameter not provided

**Solution:** Provide appropriate nonce using `--vtpm`, `--tee`, or `--token` flags

#### Nonce Size Errors

```text
nonce must be a hex encoded string of length lesser or equal <N> bytes
vTPM nonce must be a hex encoded string of length lesser or equal <N> bytes
```

**Cause:** Nonce exceeds maximum allowed size

**Solution:**

- SEV-SNP/TDX: Use ≤512-bit (64-byte) hex nonce
- vTPM/Azure: Use ≤256-bit (32-byte) hex nonce

### File System Errors

#### General File Operations

```text
failed to create output file: <error>
Error creating attestation file: <error details>
Error closing attestation file: <error details>
Error reading attestation file: <error details>
Error writing attestation file: <error details>
```

**Cause:** File system operation failed (permissions, disk space, invalid path)

**Solution:**

- Check output directory exists and is writable
- Verify sufficient disk space
- Ensure valid output file path
- Check file permissions

### Network and Connection Errors

#### Connection Errors

```text
Failed to connect to agent: <error details>
Failed to download collateral: <details>
HTTP request timeout: <details>
```

**Cause:** Network connectivity issues or agent unavailable

**Solution:**

- Verify agent is running and accessible
- Check network connectivity
- Validate connection configuration
- Increase `--timeout` and `--max_retry_delay`
- Verify firewall allows outbound connections

### Validation-Specific Errors

#### Validation Failures

```text
failed to verify TDX validation flags: <error>
```

**Cause:** TDX-specific validation parameters are invalid

**Solution:** Verify TDX flags meet requirements (correct hex encoding, proper byte lengths)

#### Certificate Validation Errors

```text
Certificate validation failed: <details>
CRL check failed: <details>
```

**Cause:** Certificate chain or CRL validation issues

**Solution:**

- Verify CA bundle paths and content
- Check certificate expiration dates
- Ensure CRL accessibility if `--check_crl` enabled

#### Measurement Validation Errors

```text
MEASUREMENT mismatch: expected <expected>, got <actual>
REPORT_DATA validation failed: <details>
```

**Cause:** Attestation report values don't match expected values

**Solution:**

- Verify expected measurement values are correct
- Check report data matches what was provided during attestation
- Ensure proper hex encoding of parameters

### Attestation Processing Errors

#### Attestation Retrieval Errors

```text
Failed to get attestation due to error: <error details>
Failed to get attestation result due to error: <error details>
```

**Cause:** Agent failed to generate attestation

**Solution:**

- Verify TEE platform support
- Check agent configuration
- Validate nonce format and size

#### Format Conversion Errors

```text
Error converting SNP attestation to JSON: <error details>
Failed to unmarshal the attestation report: <error details>
Error decoding Azure token: <error details>
```

**Cause:** Cannot convert attestation to requested format

**Solution:**

- Verify attestation data integrity
- Check format compatibility
- Retry without format conversion flags

### Configuration File Errors

```text
Error parsing config file: <error>
```

**Cause:** Invalid JSON configuration file format

**Solution:**

- Validate JSON syntax
- Ensure base64 encoding for binary fields
- Check required fields are present

## Troubleshooting Tips

1. **Start with Verbose Output:**

   ```bash
   cocos-cli attestation validate attestation.bin --mode snp --verbose ...
   ```

2. **Validate File Accessibility:**

   ```bash
   # Check attestation file exists and is readable
   ls -la attestation.bin
   file attestation.bin
   ```

3. **Test with Minimal Configuration:**

   ```bash
   # Start with basic required flags only
   cocos-cli attestation validate attestation.bin \
     --report_data $(head -c 64 /dev/zero | xxd -p) \
     --product "Milan"
   ```

4. **Verify Hex Encoding:**

   ```bash
   # Ensure hex values are properly formatted
   echo "1a2b3c4d" | xxd -r -p | xxd -p  # Should return original
   ```

5. **Check Output Format:**

   ```bash
   # For vTPM modes, try both output formats
   --format textproto  # Human readable
   --format binarypb   # Binary protocol buffer
   ```

## Success Messages

```text
Attestation result retrieved and saved successfully!
```

**Other Success Messages:**

- Algorithm upload: `Algorithm uploaded successfully!`
- Dataset upload: `Dataset uploaded successfully!`
- Key generation: `Key pair generated successfully!`
- VM creation: `VM created successfully with ID: <cvm_id>`
- VM removal: `VM removed successfully!`
- File checksum: `Checksum calculated successfully!`
- IMA measurements: `IMA measurements downloaded and verified successfully!`

## Advanced Topics

### Configuration File Management

The CLI supports various configuration file formats:

**Attestation Policy JSON:**

For attestation policy examples, see the [On-Premises Attestation Verification](on-premises-attestation-verification.md) documentation.

**Computation Manifest JSON:**

```json
{
  "id": "unique-computation-id",
  "name": "computation name",
  "description": "description of the computation",
  "datasets": [
    {
      "hash": "base64-encoded-sha3-256-hash",
      "user_key": "base64-encoded-public-key",
      "filename": "dataset.csv"
    }
  ],
  "algorithm": {
    "hash": "base64-encoded-sha3-256-hash",
    "user_key": "base64-encoded-public-key"
  },
  "result_consumers": [
    {
      "user_key": "base64-encoded-public-key"
    }
  ]
}
```

### Home Directory Integration

The CLI creates and uses the `.cocos` directory in the user's home directory for:

- Certificate caching
- Configuration storage
- Temporary file management
- Measurement cache

### Signal Handling

The CLI implements graceful shutdown:

- Handles SIGINT (Ctrl+C) and SIGTERM signals
- Cleans up temporary files on exit
- Closes active connections properly
- Saves state before termination

### Network Security

**TLS Configuration:**

- Supports TLS 1.2+ for all connections
- Certificate chain validation
- CRL (Certificate Revocation List) checking
- Custom CA certificate support

**mTLS (Mutual TLS):**

- Client certificate authentication
- Automatic certificate renewal
- Key rotation support
- Hardware security module integration

**aTLS (Attested TLS):**

- TEE attestation during TLS handshake
- Policy-based connection acceptance
- Measurement verification
- Secure key exchange within TEE

**maTLS (Attested TLS):**

- Combines both mTLS + aTLS

### Performance Optimization

**Streaming Operations:**

- Large file uploads use streaming
- Memory-efficient processing
- Progress indicators for long operations
- Concurrent connection pooling

**Caching:**

- Certificate caching in `.cocos` directory
- Measurement result caching
- Connection pooling
- DNS resolution caching

## Best Practices

1. **Hex Value Generation:** Use cryptographically secure sources for nonces and expected values
2. **Configuration Management:** Use JSON config files for complex, repeatable validations
3. **Certificate Management:** Keep CA bundles and trusted certificates up to date
4. **Error Handling:** Always check command exit codes and parse error messages
5. **Security:** Validate all input parameters and protect sensitive configuration files
6. **Network Configuration:** Configure appropriate timeouts for network-dependent operations
7. **Output Validation:** Verify output files are created and contain expected validation results
8. **Key Management:** Use proper file permissions (600) for private keys
9. **Environment Variables:** Use environment variables for server URLs and certificate paths
10. **Temporary Files:** CLI automatically cleans up temporary files, but monitor disk space
11. **Connection Pooling:** CLI reuses connections when possible for better performance
12. **Graceful Shutdown:** Use Ctrl+C to gracefully terminate operations when needed
