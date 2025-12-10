# Agent

The Agent serves as the core execution and lifecycle management component within a Trusted Execution Environment (TEE), specifically designed for secure computation workloads. The Agent is located inside the Confidential Virtual Machine (CVM), and each computation instance within a TEE is managed by its dedicated Agent. It orchestrates the computation's execution and reports its status to a central computation management server. The Manager provisions a CVM where the Agent is found. Upon receiving a computation manifest from the cloud management server agent starts its service awaiting upload of computation assets.

The following diagram illustrates the Agent's operational context within the Cocos system, specifically on an AMD SEV-SNP CPU:

![Agent](/img/agent/overview.png)

The Agent, and by extension the Cocos system, is designed for portability across various TEE-supporting platforms, provided an adequate Hardware Abstraction Layer (HAL) is in place.

## StateMachine

The Agent's operational behavior is governed by a robust state machine, which rigorously defines valid states, permissible transitions between these states triggered by external events, and the associated functions executed during these transitions.

The overall flow of a computation managed by the Agent is depicted below:

![Agent](/img/agent/state_machine.png)

### States

The Agent transitions through the following well-defined states:

- `Idle`: The initial state, where the Agent awaits the initiation of a computation.
- `ReceivingManifest`: The Agent is actively receiving the initial computation manifest. This manifest is a critical data structure containing all requisite information for the computation run, including, but not limited to, the cryptographic hash of the algorithm, the number of datasets, and the cryptographic hash of each individual dataset.
- `ReceivingAlgorithm`: The Agent is in the process of receiving the computation algorithm.
- `ReceivingData`: The Agent remains in this state until all required datasets for the computation have been successfully received. The number of expected datasets is specified within the computation manifest. Upon each dataset upload, the cryptographic hash of the incoming data is validated against the corresponding hash provided in the manifest.
- `Running`: The Agent is actively executing the computation using the received algorithm and validated datasets.
- `ConsumingResults`: The computation has completed its execution, and the results are now available for retrieval by authorized consumers.
- `Complete`: All computation results have been successfully consumed, signifying the termination of the computation's lifecycle.
- `Failed`: An unrecoverable error occurred during the computation run, leading to an abnormal termination.

### Events

State transitions within the Agent are triggered by the following events:

- `Start`: Initiates the computation startup sequence.
- `ManifestReceived`: Signals the successful reception of the computation manifest.
- `AlgorithmReceived`: Indicates that the algorithm has been successfully received. During the upload process, the cryptographic hash of the incoming algorithm is compared against the hash specified in the manifest. Following this event, the Agent transitions to the ReceivingData state if the computation requires datasets; otherwise, it directly moves to the Running state.
- `DataReceived`: Signifies that all dataset data has been successfully received.
- `RunComplete`: Signals the successful completion of the computation's execution.
- `ResultsConsumed`: Indicates that all authorized consumers have retrieved the computation results.

## Agent-Cloud Eventing

To facilitate real-time monitoring of computation progress, the Agent emits events to the cloud computation management server. These events are directly correlated with the Agent's state machine transitions and always include the current state of the Agent. Along with events agent also transmits logs from agent operations.
The following events are transmitted to the Manager:

- `IdleState`: Emitted immediately upon Agent startup.
- `InProgress`: Sent when the Agent is in the `ReceivingAlgorithm` or `ReceivingData` states, and also when the actual computation execution commences.
- `Starting`: Emitted during the initial computation setup phase, prior to the `InProgress` event for execution.
- `Ready`: Sent when the Agent enters the `ConsumingResults` state, indicating result availability.
- `Completed`: Emitted when the Agent reaches the `Complete` state, signifying successful computation lifecycle termination.
- `Failed`: Sent when the Agent enters the `Failed` state, indicating an error during computation.

## User authentication and authorization

The computation environment involves multiple user roles, including dataset providers, algorithm providers, and result consumers. Each user possesses a public/private key pair. User public keys and their associated roles are securely transmitted to the Agent as part of the computation manifest.
Every request received by the Agent that involves an asset (datasets, algorithms, or results) is cryptographically signed using the user's private key. Upon receiving such a request, the Agent performs a rigorous verification of the signature and confirms that the requesting user possesses the necessary role-based access control (RBAC) permissions before granting access to the specified asset.

## Algorithm and dataset validation and management

Prior to execution, all algorithms and datasets undergo stringent validation against the computation manifest to ensure data integrity and compatibility. This validation process includes, but is not limited to, the verification of the SHA3-256 cryptographic hash of both the dataset and the algorithm against the values specified in the manifest. For datasets, an additional check is performed to ensure that the provided filename matches the filename stipulated in the manifest.
Upon completion or termination of a computation, the Agent securely purges all associated assets from the CVM, ensuring data confidentiality and resource hygiene.

## Supported Algorithm types

The Agent supports four distinct algorithm types:

- **Binaries**: The default algorithm type, typically uploaded to the Agent.
- **Python Files**: Python algorithms provide flexibility and ease of development, with automatic dependency management within the secure enclave.
- **Docker Images**: Docker containers provide the most comprehensive packaging solution, including the complete runtime environment, system tools, and dependencies.
- **WASM Modules**: WebAssembly modules offer portable, high-performance execution with strong security isolation.

More information on how to run algorithms can be found in the [algorithms documentation](algorithms.md).

## Agent workflow

The Agent is implemented as a system service, automatically initiated upon CVM creation. Its behavior is configured through environment variables within the CVM. While these variables are automatically set, they can be manually overridden for specific deployments.
The following table details the environment variables utilized by the Agent:

| Variable                       | Description                                                                                     | Default                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------- |
| AGENT_CVM_ID                   | ID of the CVM (UUID string)                                                                     | ""                                           |
| AGENT_LOG_LEVEL                | Log level for agent service (debug, info, warn, error)                                          | debug                                        |
| AGENT_VMPL                     | When AMD SEV-SNP is used, this variables set VM privilege level for the agent                   | "2"                                          |
| AGENT_CVM_GRPC_URL             | URL of the server which sends the computation manifest                                          | "localhost:7001"                             |
| AGENT_CVM_GRPC_TIMEOUT         | Timeout period for communication with the server                                                | "60s"                                        |
| AGENT_CVM_GRPC_CLIENT_CERT     | Path to the certificate file used by the agent for mTLS communication with the sever            | ""                                           |
| AGENT_CVM_GRPC_CLIENT_KEY      | Path to the key file used by the agent for mTLS communication with the sever                    | ""                                           |
| AGENT_CVM_GRPC_SERVER_CA_CERTS | Path to servers CA root certificate used by the agent for mTLS communication with the sever     | ""                                           |
| AGENT_CVM_CA_URL               | URL for CA service, if provided it will be used for certificate generation, used only with aTLS | ""                                           |
| AGENT_GRPC_HOST                | Agent service gRPC host, used for communication with CLI                                        | ""                                           |
| AGENT_GRPC_PORT                | Agent service gRPC port, used for communication with CLI                                        | 7002                                         |
| AGENT_MAA_URL                  | URL for Microsoft Azure Attestation service                                                     | `"https://sharedeus2.eus2.attest.azure.net"` |
| AGENT_OS_BUILD                 | Defines OS build for MAA service                                                                | "UVC"                                        |
| AGENT_OS_DISTRO                | Defines OS distro for MAA service                                                               | "UVC"                                        |
| AGENT_OS_TYPE                  | Defines OS type for MAA service                                                                 | "UVC"                                        |
| AGENT_CERTS_TOKEN              | Token used for certificate generation, used only with aTLS                                      | ""                                           |

When started, the Agent first notifies the server.
The server sends a run request which contains the computation manifest.
In addition, this run requests also contains some adittional information based on the communication mode with the CLI.
If TLS (or any variety of TLS is used) the manifest also containes certificate and key files the Agent needs to use for communicating with CLI.
These files are different from ones used for server communication.
If mTLS is used for communication with the CLI, the run request will contain the root certificate of the CA used for issuing CLI certificates.
If aTLS is used for communication with the CLI, the run request will contain a flag which will indicate that the certificate needs to be extended with the attestation report.
Upon receiveng all the assets from CLI (code and datasets) the computation is run and the results can be fetched afterwards through CLI.

## Certificates

When started, the agent the Agent receives a certificate and a key file throught environment variables.
When establishing a communication channel with the CLI, a new certificate and key files will either received through a run request or, in case if aTLS, they will be generated in one of two ways.
If the CA URL and CVM ID are not specified, the agent will generate a self-signed certificate.
If the CA URL and CVM ID are specified, the agent generate a CSR and use a CA to issue a certificate which will be used for aTLS communication.
The URL of CA is configured through environment varibles (`AGENT_CVM_CA_URL`).
By default the agent uses [Abstract Machine Certificate service](https://github.com/absmach/certs) as its CA. An access token provisioned on the CA is required for certificate generation and is configured through the `AGENT_CERTS_TOKEN` environment variable.
In both cases, the generated certificate will then be extended with the attestation report.

## Attestation

The agent can fetch the [SNP attestation](./attestation-attestation-report.mdx) report from the SNP firmware that is running on the AMD Secure Processor (ASP or PSP) and the vTPM attestation report. It interacts with the vTPM to retrieve cryptographic measurements of the CVM’s boot and runtime state. These reports ensure that the CVM is running the expected code on trusted hardware and is configured correctly.

An IGVM file contains all the necessary information to launch a virtual machine on different virtualization platforms. It includes setup commands for the guest system and verification data to ensure the VM is loaded securely and correctly. The client validates the Initial Guest Virtual Machine (IGVM) file by computing its expected launch measurement and comparing it with attestation data. This step ensures that the enclave’s initial state aligns with predefined security expectations, preventing unauthorized modifications before execution. By combining SEV-SNP attestation, vTPM-based integrity checks, and IGVM validation, the Agent guarantees a trusted execution environment for secure workloads.
