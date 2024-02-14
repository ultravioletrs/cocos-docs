# Manager

Manager acts as the bridge between computation running in the VM and the user/organization. Once a computation is created by a user and the invited users have uploaded their public certificates and a run request is sent, the manager is responsible for creating the computation in the VM and managing the computation lifecycle. Communication to Manager is done via gRPC, while communication between Manager and Agent is done via vsock.

Vsock is used to send agent events from the computation in the agent to the manager. The manager then sends the events to via gRPC, and these are visible to the end user.

## Manager <> Agent

Agent runs a gRPC server, and CLI is a gRPC client of agent. The manager sends the computation to the agent via gRPC and the agent runs the computation while sending evnets back to manager on the status. The manager then sends the events it receives from agent via vsock through gRPC.
