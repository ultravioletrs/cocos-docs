# Architecture

CocosAI system is running on the host, and its main goal is to enable:

- Programmatic creation of enclaves (TEEs)
- Guest OS and system environment within the enclave VMs
- Monitoring of enclaves
- In-enclave SW manager agent
- Encrypted data transfer into the enclave and computation execution
- Result retrieval via encrypted channel to an authorized party
- Providing of HW measurement and attestation report
- Enablement of vTPM and [DICE](https://trustedcomputinggroup.org/accurately-attest-the-integrity-of-devices-with-dice/) integrity checks (root chain of trust) in order to ensure secure boot of the TEEs

These features are implemented by several independent components of CocosAI system:

1. Manager
2. Agent
3. EOS (Enclave Operating System)
4. CLI

![Cocos Arch](/img/arch.png)

> **N.B.** CocosAI open-source project does not provide Computation Management service. It is a cloud component, used to define a Computation (i.e., define computation metadata, like participants list, algorithm and data providers, result recipients, etc.). Ultraviolet provides commercial product [Prism](https://ultraviolet.rs/prism.html), a multi-party computation platform, that implements multi-tenant and scalable Computation Management service, running in the cloud or on premise, and capable to connect and control CocosAI system running on the TEE host.

## Overall System Architecture and Component Relationships

The CocosAI system is designed with a modular architecture to ensure security, scalability, and maintainability. It operates on a host machine equipped with TEE hardware, enabling secure execution of confidential workloads. The core components—Manager, Agent, EOS, and CLI—interact to provide a complete solution for confidential computing.

### Data Flow and Interaction Patterns

The typical workflow within CocosAI involves the following steps:

1. **Computation Definition**: A computation is defined via a Computation Management service (e.g., Ultraviolet's Prism). This service provides metadata such as participants, algorithms, and data providers.
2. **Enclave Creation**: The **CLI** interacts with the **Manager** to initiate the creation of a secure enclave (CVM).
3. **CVM Launch**: The **Manager** launches a Confidential Virtual Machine (CVM) on the host. During this process, it defines the CVM's firmware using an IGVM file or OVMF binary, ensuring appropriate security policies and an immutable initial state.
4. **Agent Deployment**: The **EOS** (Enclave Operating System), which contains the **Agent** and other necessary packages, is loaded and runs inside the CVM.
5. **Secure Communication Establishment**: Once the Agent is running, the Manager and Agent communicate via the 9P (Plan 9 Filesystem Protocol). This protocol facilitates lightweight and efficient file sharing, allowing the Manager to provide environment variables and TLS certificates to the Agent for secure communication with external services. Once agent starts, the user may then send the computation manifest from the computation management service, after which agent may be able to communicate with the **CLI**.
6. **Workload Provisioning**: The **CLI** communicates with the **Agent** (running inside the enclave) using gRPC. This channel is used to securely provide the algorithm (`algo` function) and data (`data` function) for the computation.
7. **Computation Execution**: The **Agent** starts the computation execution within the TEE once all the manifest assets (algos and datasets) are received.
8. **Result Retrieval**: After computation, results are retrieved via an encrypted channel to an authorized party.
9. **Attestation and Verification**: The **CLI** supports attestation verification by fetching reports from the enclave. These reports (vTPM and SEV-SNP/TDX attestation reports) are validated against IGVM launch measurements to ensure the integrity and authenticity of the CVM, confirming that only trusted enclaves are executed.
10. **Enclave Monitoring and Destruction**: The **Manager** continuously monitors the enclave's execution and health. Upon completion of the computation and secure extraction of results, the Manager is responsible for the secure destruction of the TEE and nullification of all associated data.

## Component Interfaces and APIs

### Manager

Manager is a server that creates a secure enclave and configures agent. It creates a secure enclave by launching a Confidential Virtual Machine (CVM) where computations can run.

*While this documentation uses the term "enclave," it is primarily associated with Intel SGX TEEs but also applies to other TEEs. In this context, "enclave" should be understood as a synonym for CVM.*

The Manager defines the firmware for the Confidential Virtual Machine (CVM), using either the IGVM file for SEV-SNP or the OVMF binary, depending on whether the CVM is launched with SEV-SNP. This ensures the CVM is initialized with the appropriate firmware and security policies.

**Key Responsibilities**:

- **CVM Provisioning**: Orchestrates the creation and configuration of CVMs.
- **Lifecycle Management**: Manages the entire lifecycle of TEEs, from creation to secure destruction.
- **Monitoring**: Monitors the execution and health of enclaves.
- **Communication**: Establishes initial secure communication channels (9P) with the Agent.

**Interfaces**: The Manager exposes APIs to the CLI for enclave creation, monitoring, and destruction. Its internal communication with the CVM primarily uses 9P for file system interactions. Manager also exposes a gRPC channel to receive requests.

**Technical Design Decision**: The use of IGVM files and OVMF binaries is a critical design choice for establishing a strong root of trust. By defining an immutable initial state, the system can detect any unauthorized modifications to the guest VM before execution, which is fundamental for maintaining the integrity and confidentiality of the TEE. This also supports the attestation process by providing a known, trusted baseline for measurements.

For more information on Manager, please refer to [Manager docs](./manager.md).

## Agent

The Agent runs inside the Confidential Virtual Machine (CVM) and is responsible for monitoring and managing computations within the TEE. It facilitates secure and encrypted communication with the outside world, enabling data retrieval and result transmission. Communication between the Manager and Agent happens via 9P.

9P (Plan 9 Filesystem Protocol) is a distributed file system protocol that enables lightweight, efficient file sharing by exposing remote resources as if they were local files. Files shared with the Agent include environment variables and TLS certificates required for secure communication with the cloud.

**Key Responsibilities**:

- **Computation Coordination**: Schedules and coordinates the execution of AI algorithms and data within the enclave.
- **Secure Communication**: Establishes TLS-encrypted channels with external clients (Data Providers, Algorithm Providers) for secure data and algorithm uploads.
- **Remote Attestation**: Provides remote attestation reports for the TEE, verifying the integrity of the execution environment.
- **Result Management**: Manages the secure extraction and transmission of computation results.

**Interfaces**: The Agent exposes gRPC interfaces to the CLI for receiving algorithms, data, and execution commands. It also uses 9P for communication with the Manager. Agent exposes a gRPC server for communication with CLI and a gRPC client for communication with the computation management service (bi-directional).

For more information on Agent, please refer to [Agent docs](./agent.md).

## EOS

EOS, or Enclave Operating System, is custom lightweight linux distribution built on buildroot linux. It contains agent and other packages required to run workloads in the TEE.

**Technical Design Decision**: Building EOS on Buildroot Linux allows for a highly customized and minimal operating system specifically tailored for the enclave environment. This reduces the attack surface, minimizes memory footprint, and optimizes for fast boot times, all crucial for TEE performance and security. It ensures that only necessary components are present within the sensitive enclave environment.

## CLI

CoCoS CLI is used to access the agent within the secure enclave. CLI communicates with the agent using gRPC, with functions such as algo to provide the algorithm to be run, data to provide the data to be used in the computation. It also supports attestation verification by fetching reports and validating them against IGVM launch measurements, ensuring that only trusted enclaves are executed. Verification is performed for both vTPM and SEV-SNP/TDX attestation reports to ensure the integrity and authenticity of the CVM.

**Key Responsibilities**:

- **User Interface**: Provides a text-based interface for interacting with the CocosAI system.
- **Enclave Management**: Allows users to configure, manage, and monitor confidential computations and TEEs.
- **Workload Submission**: Facilitates secure submission of algorithms and data to the Agent.
- **Attestation Verification**: Performs verification of attestation reports (vTPM and SEV-SNP) against launch measurements.
- **Scripting Capabilities**: Offers powerful scripting for automation.

**Interfaces**: The CLI communicates with the Manager and Agent primarily via gRPC.

For more information on CLI, please refer to [CLI docs](./cli.md).

## Performance Characteristics and Limitations

**Performance**:

- **Low Overhead**: The lightweight nature of EOS and the efficient 9P and gRPC communication protocols contribute to minimal performance overhead for TEE operations.
- **Fast Enclave Provisioning**: The process of launching and configuring CVMs is optimized for speed, allowing for rapid deployment of confidential workloads.
- **Optimized Execution**: Running workloads within the TEE, especially with support for Python, Docker, and WebAssembly, aims to leverage hardware-level optimizations for secure computation.

**Limitations**:

- **Resource Constraints**: TEEs typically have limited memory and CPU resources compared to general-purpose VMs. Workloads must be designed to operate within these constraints.
- **I/O Overhead**: While communication protocols are optimized, inherent overhead exists when transferring large datasets into and out of the encrypted enclave.
- **Hardware Dependency**: CocosAI relies on specific TEE hardware (e.g., AMD SEV, Intel TDX), which may limit deployment flexibility on non-compatible hardware.
- **Debugging Challenges**: Debugging within TEEs can be more complex due to their isolated and encrypted nature.
- **No Computation Management Service**: The open-source CocosAI project itself does not provide a Computation Management service. Users need to integrate with external solutions (like Ultraviolet's Prism) for defining computation metadata and managing multi-party computations.
