# Architecture

CocosAI system is running on the host, and it's main goal is to enable:

- Programatic creation of enclaves (TEEs)
- Guest OS and system environment within the enclave VMs
- Monitoring of enclaves
- In-enclave SW manager agent
- Ecrypted data transfer into the enclave and computation execution
- Result retrieval via encrypted channel to an authorized party
- Providing of HW measurement and attestation report
- Enablement of vTPM and [DICE](https://trustedcomputinggroup.org/accurately-attest-the-integrity-of-devices-with-dice/) integrity checks (root chain of trust) in order to ensure secure boot of the TEEs

These features are implemented by several independent components of CocosAI system:

1. Manager
2. Agent
3. EOS (Enclave Operating System)
4. CLI

![Cocos Arch](./img/arch.png){ align=center }


 >**N.B.** CocosAI open-source project does not provide Computation Management service. It is usually a cloud component, used to define a Computation (i.e. define computation metadata, like participants list, algorithm and data providers, result recipients, etc...). Ultraviolet provides commercial product Prism, a multi-party computation platform, that implements multi-tenant and scalable Computation Management service, running in the cloud or on premise, and capable to connect and control CocosAI system running on the TEE host.

## Manager

Manager is a gRPC client that listens to requests sent through gRPC and sends them to Agent via vsock. Manager creates a secure enclave and loads the computation where the agent resides. The connection between Manager and Agent is through vsock, through which channel agent sends events periodically to manager, who forwards these via gRPC.

## Agent

Agent defines firmware which goes into the TEE and is used to control and monitor computation within TEE and enable secure and encrypted communication with the outside world (in order to fetch the data and provide the result of the computation). The Agent contains a gRPC server that listens for requests from gRPC clients. Communication between the Manager and Agent is done via vsock. The Agent sends events to the Manager via vsock, which then forwards these via gRPC. Agent contains a gRPC server that exposes useful functions that can be accessed by other gRPC clients such as the CLI.

## EOS
EOS, or Enclave Operating System, is ...

## CLI

CoCoS CLI is used to access the agent within the secure enclave. CLI communicates to agent using gRPC, with functions such as algo to provide the algorithm to be run, data to provide the data to be used in the computation, and run to start the computation. It also has functions to fetch and validate the attestation report of the enclave.

For more information on CLI, please refer to [CLI docs](./cli.md).
