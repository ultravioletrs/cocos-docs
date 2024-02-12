# Architecture

Cocos AI system is a distributed platform for running secure multi-party computations.

It has 2 parts:

- Web application, otherwise called Prism
- In-TEE (Trusted Execution Environment) fimrware, otherwise called CoCos

## Web (Prism)

This is the web based part of the entire CoCos AI system that is used to give organizations and individuals the ability to create, run, and manage computations in the TEE. This part of CoCos AI is a distributed cloud application based on microservices.

It implementes the following microservices:

- Users - which handle User and Consortium management.
- Organizations - This contains organization management where an organization has its users, computations, and management of these.
- Computations - which define and orchestrate secure multi-party computations.
- Billing - Gives provision for an organization to get subscriptions and plans for the services that it consumes.

Prism manages the creation of computations, controls and manages the connections between the computation and manager, which runs the computation in agent which is found in the TEE. 

## TEE (CoCos)

TEE part defines firmware which goes into the TEE and is used to control and monitor computation within TEE and enable secure and encrypted communication with outside world (in order to fetch the data and provide the result of the computation). 

This SW is consisted of:

- Agent - which is loaded in the enclave and presents its entrypoint
- CLI - which is run on the client side (remote machine) and communicates with the client in the remote enclave
