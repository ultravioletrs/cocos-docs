# Computation

In CocosAI, a Computation is defined as the secure execution of an `Algorithm` on one or more `Datasets`. This framework is designed for multi-party scenarios where participants may wish to maintain the confidentiality of their intellectual property (algorithms) or sensitive information (data) from other parties involved in the computation.

The `Computation` entity itself is a structured representation encapsulating all requisite information for secure execution, including:

- **Participant Roles**: Defining the responsibilities and permissions of each user.
- **Execution Backend**: Specifying the environment where the computation will be performed (e.g., a secure enclave).
- **Cryptographic Certificates**: Essential for establishing secure communication channels and verifying identities.



## Computation Roles

Each participant in a CocosAI computation is assigned one or more distinct roles, which dictate their privileges and responsibilities within the secure workflow:

1. **Computation Owner**: The entity responsible for initiating the `Computation` and defining its parameters. The Owner invites other users and assigns their respective roles, thereby establishing the computation's access control policy.
2. **Algorithm Provider**: The user who contributes the executable program (Algorithm) to be processed within the computation.
3. **Data Provider**: The user who supplies the input `Dataset(s)` upon which the algorithm will operate. Datasets are optional, depending on the algorithm's requirements.
4. **Result Consumer**: The authorized recipient(s) of the computation's output.

It is important to note that a single user can fulfill multiple roles (e.g., an Algorithm Provider may also be a Result Consumer).

## Computation Initialization and Manifest Configuration

The foundational step for any CocosAI computation is the transmission of a `Computation Manifest` to the Cocos Agent. This manifest acts as a cryptographically signed blueprint, defining the security parameters, authorized participants, and operational configuration for the entire computation. It establishes the secure context and authorization framework governing all subsequent interactions.

The Computation Manifest is a structured JSON object with the following schema:

```json
{
  "id": "1",
  "name": "sample computation",
  "description": "sample description",
  "datasets": [
    {
      "hash": "<sha3_encoded string>",
      "userKey": "<pem_encoded public key string>"
    }
  ],
  "algorithm": {
    "hash": "<sha3_encoded string>",
    "userKey": "<pem_encoded public key string>"
  },
  "result_consumers": [
    {
      "userKey": "<pem_encoded public key string>"
    }
  ],
  "agent_config": {
    "port": "7002",
    "cert_file": "<pem encoded cert string>",
    "key_file": "<pem encoded private key string>",
    "server_ca_file": "<pem encoded cert string>",
    "client_ca_file": "<pem encoded cert string>",
    "attested_tls": true
  }
}
```

### Manifest Components and Configuration Options

- **Basic Metadata**:

  - `id` (String): A globally unique identifier for the computation.
  - `name` (String): A human-readable name for the computation.
  - `description` (String): A brief, descriptive text outlining the computation's purpose.

- **Security and Authorization**:

  - `datasets` (Array of Objects): An array specifying the expected input datasets. Each object within this array must contain:
    - `hash` (String): The SHA3 hash of the expected dataset file, ensuring data integrity.
    - `userKey` (String): The PEM-encoded public key of the authorized Data Provider for this specific dataset.
  - `algorithm` (Object): An object defining the expected algorithm. It must contain:
    - `hash` (String): The SHA3 hash of the expected algorithm file, ensuring algorithm integrity.
    - `userKey` (String): The PEM-encoded public key of the authorized Algorithm Provider.
  - `result_consumers` (Array of Objects): An array of public keys for entities authorized to retrieve the computation results. Each object contains:
    - `userKey` (String): The PEM-encoded public key of a Result Consumer.

- **Agent Configuration Options**: These parameters configure the Cocos Agent's operational behavior and secure communication.

  - `port` (String): The network port on which the Agent listens for incoming connections (default: `7002`).
  - `cert_file` (String): The PEM-encoded server certificate used by the Agent for TLS authentication.
  - `key_file` (String): The PEM-encoded private key corresponding to the Agent's cert_file.
  - `server_ca_file` (String): The PEM-encoded Certificate Authority (CA) file used by the Agent to verify client certificates when mutual TLS is enabled.
  - `client_ca_file` (String): The PEM-encoded CA file used by the Agent to verify client certificates, enabling mutual TLS for enhanced security.
  - `attested_tls` (Boolean): A flag indicating whether Attested TLS is enabled. When `true`, the Agent leverages hardware-backed security features (e.g., Intel TDX, AMD SEV-SNP) to provide cryptographic proof of its integrity and authenticity to connecting clients.

### Cryptographic Security Framework

The manifest establishes a robust cryptographic framework. Each `userKey` specified within the manifest represents a public key corresponding to a user's private key. When users upload assets (algorithms or datasets) using `cocos-cli`, their requests are digitally signed with their respective private keys. The Cocos Agent verifies these digital signatures against the public keys declared in the manifest. This mechanism provides:

- **Authenticity**: Guarantees that all uploaded assets and requests originate from the declared and authorized users.
- **Integrity**: Ensures that uploaded data and algorithms have not been tampered with during transit or storage.
- **Authorization**: Prevents unauthorized entities from contributing assets to the computation.

Upon successful boot, the Cocos Agent fetches and parses the `Computation Manifest`. This allows the Agent to:

- Identify all participants and their assigned roles.
- Establish trust relationships for incoming connections (e.g., from which `userKey` it can accept data).
- Determine the expected algorithm and the number of datasets, enabling it to track the completion of asset reception.
- Identify the authorized `Result Consumers` to whom the final computation output must be securely transmitted.
