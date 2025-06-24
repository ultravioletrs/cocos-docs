---
slug: /
---

# What is Cocos AI

CocosAI (Confidential Computing System for AI) is a software platform designed to enable confidential and privacy-preserving AI and machine learning. It allows model training and inference to be performed directly on sensitive data—without ever exposing that data. This approach addresses one of the key challenges in AI today: protecting privacy while unlocking the full potential of intelligent systems. By ensuring trust and privacy, Cocos AI opens the door to secure and collaborative AI development.

At its core, Cocos AI is built on Confidential Computing—an emerging paradigm that uses specialized hardware (CPU extensions) to create secure, encrypted enclaves in memory, known as Trusted Execution Environments (TEEs). These enclaves isolate data and code from the rest of the system, providing a strong layer of protection even from privileged software on the host machine.

The result is a platform that empowers data scientists to train AI/ML models on private data—without ever seeing or exposing that data. It also supports Secure Multi-Party Computation (SMPC), enabling joint analysis and model training across datasets from different sources. This capability unlocks significant value while maintaining strict privacy guarantees.

![Collaborative AI drawio](https://user-images.githubusercontent.com/23095882/183417817-a5013c43-637e-488b-9e06-ee6fe8e588b0.svg)

## Features

CCoCoS AI provides a comprehensive set of features to enable secure, confidential AI workflows:

- Trusted Execution Environment (TEE) Support
Full lifecycle support for TEE deployment, management, and monitoring.

- In-Enclave System Software
Includes in-enclave agents, networking controllers, and supporting components for secure execution.

- Encrypted Data Transfer
Asynchronous, end-to-end encrypted data and result transmission between components.

- Programmable API
Flexible APIs for managing and customizing platform behavior programmatically.

- Attestation and Verification
Hardware- and software-based attestation mechanisms, along with verification tools to ensure trustworthiness.

- Command Line Interface (CLI)
A powerful CLI tool for interacting with and controlling the CoCoS AI system.

## License

CocosAI is published under liberal [Apache-2.0](https://github.com/ultravioletrs/cocos/blob/main/LICENSE) open-source license.

## GitHub

CocosAI can be downloaded from its [GitHub repository](https://github.com/ultravioletrs/cocos)
