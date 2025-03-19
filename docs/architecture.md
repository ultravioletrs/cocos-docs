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

![Cocos Arch](/img/arch.png)

> **N.B.** CocosAI open-source project does not provide Computation Management service. It is a cloud component, used to define a Computation (i.e. define computation metadata, like participants list, algorithm and data providers, result recipients, etc...). Ultraviolet provides commercial product [Prism](https://ultraviolet.rs/prism.html), a multi-party computation platform, that implements multi-tenant and scalable Computation Management service, running in the cloud or on premise, and capable to connect and control CocosAI system running on the TEE host.

## Manager

Manager is a server that creates a secure enclave and loads the computation where the agent resides. It creates a secure enclave by launching a Confidential Virtual Machine (CVM) where computations can run.

*While this documentation uses the term "enclave," it is primarily associated with Intel SGX TEEs but also applies to other TEEs. In this context, "enclave" should be understood as a synonym for CVM.*

The Manager defines the firmware for the Confidential Virtual Machine (CVM), using either the [IGVM file](#igvm-file) for SEV-SNP or the OVMF binary for SEV, depending on whether the CVM is launched with SEV or SEV-SNP. This ensures the CVM is initialized with the appropriate firmware and security policies.

For more information on Manager, please refer to [Manager docs](./manager.md).

## Agent

The Agent runs inside the Confidential Virtual Machine (CVM) and is responsible for monitoring and managing computations within the TEE. It facilitates secure and encrypted communication with the outside world, enabling data retrieval and result transmission. Communication between the Manager and Agent happens via 9P.

9P (Plan 9 Filesystem Protocol) is a distributed file system protocol that enables lightweight, efficient file sharing by exposing remote resources as if they were local files. Files shared with the Agent include environment variables and TLS certificates required for secure communication with the cloud.

## IGVM File

An IGVM file defines the immutable initial state of a guest VM in an enclave, specifying memory and system configurations. This ensures that any modifications are detected, preventing unauthorized changes and maintaining the enclave’s security before execution.

For more information on Agent, please refer to [Agent docs](./agent.md).

## EOS

EOS, or Enclave Operating System, is custom lightweight linux distribution built on buildroot linux. It contains agent and other packages required to run workloads in the TEE.

## CLI

CoCoS CLI is used to access the agent within the secure enclave. CLI communicates to agent using gRPC, with functions such as algo to provide the algorithm to be run, data to provide the data to be used in the computation, and run to start the computation. It also supports attestation verification by fetching reports and validating them against IGVM launch measurements, ensuring that only trusted enclaves are executed. Verification is performed for both vTPM and SEV-SNP attestation reports to ensure the integrity and authenticity of the CVM.

For more information on CLI, please refer to [CLI docs](./cli.md).
