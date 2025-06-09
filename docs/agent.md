# Agent

The agent is responsible for the life cycle of the computation, i.e., running the computation and sending events about the status of the computation within the TEE. The agent is found inside the VM (TEE), and each computation within the TEE has its own agent. When a computation run request is sent from the manager, manager creates a VM where the agent is found and sends the computation manifest to the agent.

The picture below shows where the agent runs in the Cocos system, helping us better understand its role.

![Agent](/img/agent.png)

## StateMachine

- Orchestrates the overall flow of the computation.
- Transitions between states based on received events.
- Defines valid state transitions and associated functions.

### States

- `idle`: Initial state, waiting for the computation to start.
- `receivingManifest`: Receives the initial computation manifest.
- `receivingAlgorithm`: Receives the algorithm for the computation.
- `receivingData`: Receives dataset data for the computation.
- `running`: Executes the computation using received algorithms and data.
- `resultsReady`: Computation has finished, results are available.
- `complete`: All results have been consumed, computation lifecycle ends.

### Events

- `start`: Triggers the computation startup process.
- `manifestReceived`: Indicates computation manifest has been received.
- `algorithmReceived`: Indicates the algorithm has been received.
- `dataReceived`: Indicates all dataset data has been received.
- `runComplete`: Signals the completion of the computation execution.
- `resultsConsumed`: Indicates all consumers have retrieved the results.

## Agent Events

As the computation in the agent undergoes different operations, it sends events to the manager so that the user can monitor the computation from either the UI or other client. Events sent to the manager are based on the agent state as defined by the statemachine.

## Certificates

When started, the agent will generate a certificate in one of two ways. 
If the CA URL and CVM ID are not specified, the agent will generate a self-signed certificate.
If the CA URL and CVM ID are specified, the agent generate a CSR and use a CA to issue a certificate which will be used for TLS communication.
The URL of CA is configured through environment varibles.
By default the agent uses [Abstract Machine Certificate service](https://github.com/absmach/certs) as its CA.
In both cases, the generated certificate will then be extended with the attestation report.

## Attestation

The agent can fetch the [SNP attestation](./attestation.md) report from the SNP firmware that is running on the AMD Secure Processor (ASP or PSP) and the vTPM attestation report. It interacts with the vTPM to retrieve cryptographic measurements of the CVM’s boot and runtime state. These reports ensure that the CVM is running the expected code on trusted hardware and is configured correctly.

An IGVM file contains all the necessary information to launch a virtual machine on different virtualization platforms. It includes setup commands for the guest system and verification data to ensure the VM is loaded securely and correctly. The client validates the Initial Guest Virtual Machine (IGVM) file by computing its expected launch measurement and comparing it with attestation data. This step ensures that the enclave’s initial state aligns with predefined security expectations, preventing unauthorized modifications before execution. By combining SEV-SNP attestation, vTPM-based integrity checks, and IGVM validation, the Agent guarantees a trusted execution environment for secure workloads.

## Algorithm and dataset validation

Before execution, algorithms and datasets are validated against the computation manifest to ensure integrity and compatibility. This includes the sha3 256 hash of the dataset and algorithm, which are validated against the value set in the manifest. The algorithm and dataset provider ID are also validated against the manifest during the uploading of the dataset and algorithm.

## Supported Algorithm types

There are four supported algorithm types, binaries, python files, docker images and wasm modules. The default algorithm type is binaries, which is uploaded to agent using CLI. Instructions on how to provide a python file are provided in [CLI](./cli.md). More information on how to run the other types of algorithms can be found [here](algorithms.md).
