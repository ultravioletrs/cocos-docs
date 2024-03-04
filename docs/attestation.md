# Attestation

Remote attestation is a process in which one side (the attester) collects information about itself and sends that information to the client (or the relying party) for the relying party to assess the trustworthiness of the attester. If the attester is deemed trustworthy, the relying party will send confidential code/data or any secrets to the attester.

Before we look at the attestation report diagram, we need to define a few software components of the protocol:

 * Agent - the software that is running inside the HAL. It is responsible for fetching the attestation report and running the computation.
 * Cocos CLI - command line application running on the machines of each Secure Multiparty Computation (SMPC) member. It is responsible for attestation report verification.

The Agent is responsible for fetching the attestation report from the secure virtual machine (SVM). This procedure is safe because the Kernel and the AMD Secure Processor (ASP) can exchange encrypted messages that can only be decrypted by the Kernel and the ASP. The keys used for the encryption/decryption are inserted by the ASP into the memory of the SVM during boot, thus ensuring that only the ASP and the SVM have the keys for communication.

The attestation protocol begins after the SVM is booted. Then, the cocos CLI application can communicate with the Agent and use mutual attested TLS to verify the attestation report and form a secure communication channel.
