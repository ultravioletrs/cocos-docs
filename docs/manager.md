# Manager

Manager acts as the bridge between computation running in the VM and the web based Prism that has user and consortium management for the different end users. Once a computation is created by a user in Prism and the invited users have uploaded their public certificates, the manager is responsible for creating the computation in the VM and managing the computation lifecycle. Communication between Prism and Manager is done via HTTP, while communication between Manager and Agent is done via gRPC / vsock.

Vsock is used to send agent events from the computation in the agent to the manager. The manager then sends the events to Prism via HTTP, and these are visible to the end user on the Prism UI or command line. Manager is a gRPC client for prism and that is used to access the gRPC server in the agent service.

## Manager <> Agent

Agent runs a gRPC server and manager is a gRPC client. The manager sends the computation to the agent and the agent runs the computation. The manager then sends the events it receives from agent via vsock to Prism through HTTP.

## Prism <> Manager

Connection between Prism and Manager is done via HTTP. Prism sends the computation created by the user on the ui to the manager and the manager sends the events it receives from agent to Prism.
