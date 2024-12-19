# Attestation

Remote attestation is a process in which one side (the attester) collects information about itself and sends that information to the client (or the relying party) so that the relying party can verify the attester. The successful verification proves to the relying party that the secure virtual machine (SVM) runs the expected code on the expected hardware and is configured correctly. If the attester is deemed trustworthy, the relying party will send confidential code/data to the attester. This information implies that a secure channel needs to be formed between the attester and the relaying party. The secure channel is created using attested TLS.

Cocos has two software components that represent the attester and the relying party:

1. The Agent - software application that is running inside the HAL. It is responsible for fetching the attestation report and running the computation.
2. Cocos CLI - a command-line application running on the machines of each Secure Multiparty Computation (SMPC) member. It verifies the attestation report and sends confidential code/data to the Agent.

## What are the parts of the attestation report?

One of the essential parts of the attestation report is the measurement. The measurement represents the hash of the entire SVM or the hash of the [HAL](./hal.md). This way, the measurement provides a way for the client to verify the contents of the entire SVM.

Along with the measurement, the attestation report provides additional information about the booted SVM and underlying hardware, such as the policy with which the SVM was booted and the SNP firmware's trusted computing base (TCB) version.

The AMD SEV-SNP attestation report can also be filled with arbitrary data. The width of this data field is 512 bits, and it is called report data. The report data content is provided by the Agent to the ASP every time the attestation report is generated.

The last part of the report is the signature. The hardware signs the AMD SEV-SNP attestation report using the Versioned Chip Endorsement Key (VCEK). VCEK is derived from chip unique secrets and the current SNP firmware TCB. The signature is verified by obtaining the certificate for the VCEK from the AMD Key Distribution System (KDS). By verifying the signature, the relying party can be sure that the SVM is running on genuine AMD hardware and that the AMD Secure Processor (ASP) generated the attestation report.

## How is the attestation report fetched?

The Agent is responsible for fetching the attestation report from the SVM. This procedure is safe because the Kernel and the ASP can exchange encrypted messages that can only be decrypted by the Kernel and the ASP. The keys used for the encryption/decryption are inserted by the ASP into the memory of the SVM during boot, thus ensuring that only the ASP and the SVM have the keys for safe communication.

## Attested TLS

For the relying party to send confidential data or code to the Agent, a secure channel must be established between them. This is done using attested TLS, which is a TLS connection where the server's certificate is extended with the attestation report. The SVM is the server in Cocos. The Agent generates a self-signed x.509 certificate extended with the attestation report. When fetching the attestation report, the Agent inserts the hash of the public key into it using the field report data. The whole process can be seen in the below picture. The green color represents the trusted part of the system, while the red is untrusted.

![Attested TLS](/img/atls.png)

The relying party uses the Cocos CLI to verify the self-signed certificate and the attestation report that is part of it. Successful verification proves to the relying party that the certificate is generated inside the SVM because the certificate's public key is part of the attestation report.
