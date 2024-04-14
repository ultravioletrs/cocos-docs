# TEE

A trusted execution environment (TEE) is a separate part of the main memory and the CPU that encrypts code/data and enables "on the fly" executions of the said encrypted code/data. One of the examples of TEEs is Intel Secure Guard Extensions (SGX) and AMD Secure Encrypted Virtualization (SEV).

## AMD SEV

AMD SEV and its latest and most secure iteration, AMD Secure Encrypted Virtualization - Secure Nested Paging (SEV-SNP), is the AMD technology that isolates entire virtual machines (VMs). SEV-SNP encrypts the whole VM and provides confidentiality and integrity protection of the VM memory. This way, the hypervisor or any other application on the host machine cannot read the VM memory.

In CocosAI, we use an in-memory VM image called the Hardware Abstraction Layer (HAL). You can read more on HAL [here](hal.md).

One of the critical components of the SEV technology is the remote attestation. Remote attestation is a process in which one side (the attester) collects information about itself and sends that information to the client (or the relying party) for the relying party to assess the trustworthiness of the attester. If the attester is deemed trustworthy, the relying party will send confidential code/data or any secrets to the attester. You can read more on the attestation process [here](attestation.md).