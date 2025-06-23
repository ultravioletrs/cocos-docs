# Agent

The agent is responsible for the life cycle of the computation, i.e., running the computation and sending events about the status of the computation within the TEE. The agent is found inside the VM (TEE), and each computation within the TEE has its own agent. When a computation run request is sent from the manager, manager creates a VM where the agent is found and sends the computation manifest to the agent.

The picture below shows where the agent runs in the Cocos system, helping us better understand its role.

![Agent](/img/agent/overview.png)

## StateMachine

The agent operates like a state machine.
This state machine defines valid states, transitions between these states based on received events and functions associated with these transitions.

The picture below show the overall flow of the computation.

![Agent](/img/agent/state_machine.png)

### States

- `Idle`: Initial state, waiting for the computation to start.
- `ReceivingManifest`: Receives the initial computation manifest. The computation manifest contains all the information necessary for the computaion run. Most important pieces of information are the hash of the algorithm, number of datasets and the hash of each dataset.
- `ReceivingAlgorithm`: Receives the algorithm for the computation.
- `ReceivingData`: Receives dataset data for the computation. The agent remains in this state until it receives all the datasets. The number of datasets is determined by the computaion manifest. Upon each upload, the hash of the incoming dataset is compared to the hash of the dataset sent in the manifest.
- `Running`: Executes the computation using received algorithms and data.
- `ConsumingResults`: Computation has finished, results are available.
- `Complete`: All results have been consumed, computation lifecycle ends.
- `Failed`: An error was encountered during the computation run.

### Events

- `Start`: Triggers the computation startup process.
- `ManifestReceived`: Indicates computation manifest has been received.
- `AlgorithmReceived`: Indicates the algorithm has been received. During the upload the hash of the incoming algorithm is compared to the hash of the algorithm sent in the manifest. If datasets are expected the Agent moves into `ReceivingData` state, otherwise it moves in `Running` state.
- `DataReceived`: Indicates all dataset data has been received.
- `RunComplete`: Signals the completion of the computation execution.
- `ResultsConsumed`: Indicates all consumers have retrieved the results.

## Agent Events

As the computation in the agent undergoes different operations, it sends events to the manager so that the user can monitor the computation from either the UI or other client.
Events sent to the manager are based on the agent state as defined by the statemachine.
Each event includes the current state of the agent.
These events are:

- `IdleState`: This event is sent upon agent startup.
- `InProgress`: This event is sent when the agent is in `ReceivingAlgorithm` or `ReceivingData` state. This event is also sent when the actual computation is started.
- `Starting`: This event is sent when the agent is starting the computation. During this phase (before the `InProgress` event) the agent is performing computation setup.
- `Ready`: This event is sent when the agent is in `ConsumingResults` state.
- `Completed`: This event is sent when the agent is in `Complete` state.
- `Failed`: This event is sent when the agent is in `Failed` state.

## Algorithm and dataset validation

Before execution, algorithms and datasets are validated against the computation manifest to ensure integrity and compatibility. This includes the sha3 256 hash of the dataset and algorithm, which are validated against the value set in the manifest. The algorithm and dataset provider ID are also validated against the manifest during the uploading of the dataset and algorithm.

## Supported Algorithm types

There are four supported algorithm types, binaries, python files, docker images and wasm modules. The default algorithm type is binaries, which is uploaded to agent using CLI. Instructions on how to provide a python file are provided in [CLI](./cli.md). More information on how to run the other types of algorithms can be found [here](algorithms.md).

## Agent workflow

The agent is implemented as a system service and is started upon CVM creation.
The agent is configured through CVMs environment variables.
Below you can find a table of environment variables used by the Agent.
These are all set automatically, but can be changed manually.

| Variable                       | Description                                                                                                   | Default                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| AGENT_CVM_ID                   | ID of the CVM (UUID string)                                                                                   | ""                                           |
| AGENT_LOG_LEVEL                | Log level for agent service (debug, info, warn, error)                                                        | debug                                        |
| AGENT_VMPL                     | When AMD SEV-SNP is used, this variables set VM privilege level for the agent                                 | "2"                                          |
| AGENT_CVM_GRPC_URL             | URL of the server which sends the computation manifest                                                        | "localhost:7001"                             |
| AGENT_CVM_GRPC_TIMEOUT         | Timeout period for communication with the server                                                              | "60s"                                        |
| AGENT_CVM_GRPC_CLIENT_CERT     | Path to the certificate file used by the agent for mTLS communication with the sever                          | ""                                           |
| AGENT_CVM_GRPC_CLIENT_KEY      | Path to the key file used by the agent for mTLS communication with the sever                                  | ""                                           |
| AGENT_CVM_GRPC_SERVER_CA_CERTS | Path to servers CA root certificate used by the agent for mTLS communication with the sever                   | ""                                           |
| AGENT_CVM_CA_URL               | URL for CA service, if provided it will be used for certificate generation, used only with aTLS               | ""                                           |
| AGENT_GRPC_HOST                | Agent service gRPC host, used for communication with CLI                                                      | ""                                           |
| AGENT_GRPC_PORT                | Agent service gRPC port, used for communication with CLI                                                      | 7002                                         |
| AGENT_MAA_URL                  | URL for Microsoft Azure Attestation service                                                                   | `"https://sharedeus2.eus2.attest.azure.net"` |
| AGENT_OS_BUILD                 | Defines OS build for MAA service                                                                              | "UVC"                                        |
| AGENT_OS_DISTRO                | Defines OS distro for MAA service                                                                             | "UVC"                                        |
| AGENT_OS_TYPE                  | Defines OS type for MAA service                                                                               | "UVC"                                        |

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
By default the agent uses [Abstract Machine Certificate service](https://github.com/absmach/certs) as its CA.
In both cases, the generated certificate will then be extended with the attestation report.

## Attestation

The agent can fetch the [SNP attestation](./attestation.md) report from the SNP firmware that is running on the AMD Secure Processor (ASP or PSP) and the vTPM attestation report. It interacts with the vTPM to retrieve cryptographic measurements of the CVM’s boot and runtime state. These reports ensure that the CVM is running the expected code on trusted hardware and is configured correctly.

An IGVM file contains all the necessary information to launch a virtual machine on different virtualization platforms. It includes setup commands for the guest system and verification data to ensure the VM is loaded securely and correctly. The client validates the Initial Guest Virtual Machine (IGVM) file by computing its expected launch measurement and comparing it with attestation data. This step ensures that the enclave’s initial state aligns with predefined security expectations, preventing unauthorized modifications before execution. By combining SEV-SNP attestation, vTPM-based integrity checks, and IGVM validation, the Agent guarantees a trusted execution environment for secure workloads.
