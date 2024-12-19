---
slug: /
---

# What is CocosAI

CocosAI (Confidential Computing System for AI) is a SW system for enabling confidential and privacy-preserving AI/ML, i.e. execution of model training and algorithm inference on confidential data sets. Privacy-preservation is considered a “holy grail” of AI. It opens many possibilities, among which is a collaborative, trustworthy AI.

CocosAI leverages Confidential Computing, a novel paradigm based on specialized HW CPU extensions for producting secure encrypted enclaves in memory (Trusted Execution Enviroments, or TEEs), thus isolating confidential data and programs from the rest of the SW running on the host.

The final product enables data scientists to train AI and ML models on confidential data that is never revealed, and can be used for Secure Multi-Party Computation (SMPC). AI/ML on combined data sets that come from different sources will unlock huge value.

![Collaborative AI drawio](https://user-images.githubusercontent.com/23095882/183417817-a5013c43-637e-488b-9e06-ee6fe8e588b0.svg)

## Features

CoCoS.ai is enabling the following features:

- TEE enablement, deployment and monitoring
- In-enclave agent, networking controller and other system software
- Encrypted asynchronous data transfer and result delivery
- API for programmable platform manipulation
- HW and SW supported attestation with verification tools
- CLI for system interaction

## License

CocosAI is published under liberal [Apache-2.0](https://github.com/ultravioletrs/cocos/blob/main/LICENSE) open-source license.

## GitHub

CocosAI can be downloaded from its [GitHub repository](https://github.com/ultravioletrs/cocos)
