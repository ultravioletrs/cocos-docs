## Architecture
Cocos AI system is a distributed platform for running secure multi-party computations.

It has 2 parts:

- Web application
- In-TEE fimrware

### Web
Web part of the Cocos AI is a distributed cloud application based on microservices.

It implementes the following microservices:

- Clients - which handle User and Consortium management
- Datasets - which define data resources used in the computation
- Computations - which define and orchestrate secure multi-party computations

### TEE
TEE part defines firmware which goes into the TEE and is used to control and monitor computation within TEE and enable secure and encrypted communication with outside world (in order to fetch the data and provide the result of the computation).

This SW is consisted of:

- Agent - which is loaded in the enclave and presents its entrypoint
- CLI - which is run on the client side (remote machine) and communicates with the client in the remote enclave