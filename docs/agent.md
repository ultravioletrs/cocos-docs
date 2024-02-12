# Agent

The agent is responsible for the life cycle of the computation, i.e., running the computation and sending events about the status of the computation within the TEE. The agent is found inside the VM (TEE), and each computation within the TEE has its own agent. When a computation run request is sent from from the manager, a manager creates a VM where the agent is found and sends the computation manifest to the agent.

## Agent events

As the computation in the agent undergoes different operations, it sends events to the manager so that the user can monitor the computation from either the UI or other client. Events sent to the manager include computation running, computation finished, computation failed, and computation stopped.

## gRPC connection between agent & manager

Agent is has a gRPC server which different clients such as CLI and manager can use to access different operations within the agent.

## Security

To run a computation in the agent, a signed certificate is required. The certificate is used to verify the user who is running the computation. The certificate is sent to the agent by the manager, and the agent verifies the certificate before running the computation.
