# Computation
Computation in CocosAI is any execution of a program (Algorithm) or an data set (Data), that can be one data file, or a lot of files comping from different parties.

Computations are multi-party, meaning that program and data providers can be different parties that do not want to expose their intellectual property to other parties participating in the computation.

`Computation` is a structure that holds all the necessary information needed to execute the computation securely (list of participants, execution backend - i.e. where computation will be executed, role of each participant, cryptographic certificates, etc...).

## Computation Roles
Computation is multi-party, i.e. has multiple participants. Each of the users that participate in the computation can have one of the follwoing roles:

1. **Algorithm Provider** - user that will provide th actual program to be executed
2. **Data Provider** - user that will provide a data on which algorithm will be executed, i.e. data which algorithm will process
3. **Result Consumer** - user that will recieve result after the processing

One user can have several roles - for example, Algorithm Provider can also be a Result Recipient.

## Computation Manifest
Computation Manifest represent that Computation description and is sent upon `run` command to the Manager as a JSON.

Manager fetches the Computation Manifest and sends it into the TEE to Agent, via vsock.

The first thing that Agent does upon boot, is that it fetches the Computation Manifest and reads it. For this Manifest, Agent understands who are the participants in the computation adn with wich role, i.e. from whom it can accept the connections and what data they will send. Agent also learns from the Manifest what algorithm is used and how many datasets will be provided. This way it knows when it received all necessary files to start the execution. Finally, Agent learns from the Manifest to whom it needs to send the Result of the computation.

## Algorithm
An algorithm represents a program which is executed by agent for the given datasets. An algorithm is supplied with a unix socket to report results, paths to dataset files. The command for an algorithm run by manager looks as below:

```bash
<algorithm_binary> <unix_socket_path> <dataset1_file_path> <dataset2_file_path> ...
```

The number of datasets provided to an algorithm is declared on the manifest by the number of algorithm providers. Algorithms are only run after all datasets have been received.

For users writing algorithms using python, the scripts will need to be compiled into executable binary file. The process can be done as below:

```bash
pip install -U pyinstaller
pyinstaller --onefile <algorith_file.py>
# make the binary static
pip install staticx
staticx <algorithm_binary_file> <algorithm_binary_file_static>
```
