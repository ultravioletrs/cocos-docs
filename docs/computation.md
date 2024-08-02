# Computation

Computation in CocosAI is any execution of a program (Algorithm) on a data set (Data), that can be one data file, or a lot of files coming from different parties.

Computations are multi-party, meaning that program and data providers can be different parties that do not want to expose their intellectual property to other parties participating in the computation.

`Computation` is a structure that holds all the necessary information needed to execute the computation securely (list of participants, execution backend - i.e. where computation will be executed, role of each participant, cryptographic certificates, etc...).

## Computation Roles

Computation is multi-party, i.e. has multiple participants. Each of the users that participate in the computation can have one of the following roles:

1. **Computation Owner** - user that created the `Computation` and that defines who will participate in it and with which role (by inviting other users to the Computation)
2. **Algorithm Provider** - user that will provide the actual program to be executed
3. **Data Provider** - user that will provide data on which the algorithm will be executed, i.e. data which algorithm will process
4. **Result Recipient** - user that will recieve result after the processing

One user can have several roles - for example, an Algorithm Provider can also be a Result Recipient.

## Computation Manifest

Computation Manifest represents the Computation description and is sent upon `run` command to the Manager as a JSON.

Manager fetches the Computation Manifest and sends it into the TEE to Agent, via vsock.

The first thing that Agent does upon boot, is that it fetches the Computation Manifest and reads it. For this Manifest, Agent understands who are the participants in the computation adn with wich role, i.e. from whom it can accept the connections and what data they will send. Agent also learns from the Manifest what algorithm is used and how many datasets will be provided. This way it knows when it received all necessary files to start the execution. Finally, Agent learns from the Manifest to whom it needs to send the Result of the computation.
