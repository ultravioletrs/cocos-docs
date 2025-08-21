# Algorithm Tutorials

Cocos supports running various types of algorithms within a secure enclave environment. This document provides streamlined tutorials for setting up and executing binary algorithms, Python scripts, Docker images, and WebAssembly (Wasm) modules.

**Important Note on Order of Execution:** The Cocos system involves several components that must be started and interacted with in a specific sequence. Pay close attention to the order of commands and the expected outputs at each step.

## Core Concepts & Initial Setup

Before diving into specific algorithm types, understand these fundamental steps applicable to all Cocos computations:

- **Enclave:** A secure, isolated environment on the host machine where computations run.
- **Manager:** Responsible for creating and managing Virtual Machines (CVMs) that host the enclaves.
- **Agent:** Runs inside the CVM, executing the algorithm and communicating with the outside world.
- **CVMS Server (Computation Management Server):** A server that the CVM connects to, providing the algorithm and datasets.
- **cocos-cli:** The command-line interface tool used to interact with the Manager and Agent.

### Prerequisites

1. **Clone the cocos repository:**

   ```bash
   git clone https://github.com/ultravioletrs/cocos.git
   cd cocos
   ```

2. **Clone the ai repository (for example algorithms):**

   ```bash
   git clone https://github.com/ultravioletrs/ai.git
   ```

3. **Rust Installation:** Ensure Rust is installed if you plan to build binary or Wasm examples. Follow the [installation instructions](https://www.rust-lang.org/tools/install).

4. **Terminate Previous Computations:** Always ensure any previous computations are terminated before starting a new one to avoid conflicts.

### Finding Your Host IP Address

The CVMS server needs to be reachable from the virtual machine. Avoid using localhost for the CVMS host address.

To find your host machine's IP address:

```bash
ip a
```

Look for your network interface (e.g., wlan0 for WiFi, eth0 for Ethernet) and note the inet address. For example:

```bash
2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 12:34:56:78:9a:bc brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic noprefixroute wlan0
```

In this example, `192.168.1.100` is the IP address to use.

### Starting Core Services

These services must be running before you can create a CVM or upload algorithms.

#### Start the Computation Management Server (CVMS)

Navigate to the cocos directory and start the CVMS server. Replace `192.168.1.100` with your actual host IP address.

```bash
cd cocos
HOST=<YOUR_HOST_IP> go run ./test/cvms/main.go -public-key-path public.pem -attested-tls-bool false -algo-path <ALGORITHM_PATH> [-data-paths <DATASET_PATH>]
```

**Note:**

- `<ALGORITHM_PATH>` and `[-data-paths <DATASET_PATH>]` will be specific to the algorithm type you are running. We'll specify these in the respective sections below.
- Expected output:

  ```bash
  {"time":"...","level":"INFO","msg":"cvms_test_server service gRPC server listening at 192.168.1.100:7001 without TLS"}
  ```

#### Start the Manager

Navigate to the cocos/cmd/manager directory and start the Manager. This requires sudo.

```bash
cd cocos/cmd/manager
sudo \
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_GRPC_HOST=localhost \
MANAGER_GRPC_PORT=7002 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
go run main.go
```

Expected output (look for the gRPC server listening message):

```bash
{"time":"...","level":"INFO","msg":"Manager started without confidential computing support"}
{"time":"...","level":"INFO","msg":"manager service gRPC server listening at localhost:7002 without TLS"}
```

## Running Binary Algorithms

Binary algorithms are compiled to run directly on the enclave.

### Without Datasets (Addition Example)

#### Build the Addition Algorithm

1. Navigate to the ai/burn-algorithms directory:

   ```bash
   cd ../ai/burn-algorithms
   ```

2. Build the addition-cocos binary:

   ```bash
   cargo build --release --bin addition-cocos --features cocos
   ```

3. Copy the compiled binary to your cocos directory:

   ```bash
   cp ./target/release/addition-cocos ../../cocos/
   ```

#### Start CVMS for Addition Binary

From your cocos directory, start the CVMS server, specifying the addition-cocos binary:

```bash
cd cocos
HOST=<YOUR_HOST_IP> go run ./test/cvms/main.go -algo-path ./addition-cocos -public-key-path public.pem -attested-tls-bool false
```

#### Create CVM for Addition

From your cocos directory:

```bash
export MANAGER_GRPC_URL=localhost:7002
./build/cocos-cli create-vm --log-level debug --server-url "<YOUR_HOST_IP>:7001"
```

**Important:** Note the id and port from the cocos-cli output. The port (default 6100) is for the Agent's gRPC URL.

Expected cocos-cli output:

```bash
🔗 Connected to manager using  without TLS
🔗 Creating a new virtual machine
✅ Virtual machine created successfully with id <CVM_ID> and port <AGENT_PORT>
```

Expected CVMS server output (showing CVM connection):

```bash
&{message:"Method InitComputation for computation id 1 took ... to complete without errors"  computation_id:"1"  level:"INFO"  timestamp:{...}}
&{event_type:"ReceivingAlgorithm"  timestamp:{...}  computation_id:"1"  originator:"agent"  status:"InProgress"}
&{message:"agent service gRPC server listening at 10.0.2.15:<AGENT_PORT> without TLS"  computation_id:"1"  level:"INFO"  timestamp:{...}}
```

#### Export Agent gRPC URL for Addition

Set the AGENT_GRPC_URL using the port noted in the previous step (default 6100):

```bash
export AGENT_GRPC_URL=localhost:6100
```

#### Upload the Addition Algorithm

From your cocos directory:

```bash
./build/cocos-cli algo ./addition-cocos ./private.pem
```

Expected output:

```bash
🔗 Connected to agent  without TLS
Uploading algorithm file: ./addition-cocos
🚀 Uploading algorithm [███████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                               
Successfully uploaded algorithm! ✔ 
```

Since this is a binary algorithm and the addition example, no requirements file or dataset upload is needed.

#### Download Addition Results

From your cocos directory:

```bash
./build/cocos-cli result ./private.pem
```

Expected output:

```bash
🔗 Connected to agent  without TLS
⏳ Retrieving computation result file
📥 Downloading result [██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                               
Computation result retrieved and saved successfully as results.zip! ✔ 
```

#### View Addition Results

```bash
unzip results.zip -d results
cat results/results.txt
```

Expected output:

```bash
"[5.141593, 4.0, 5.0, 8.141593]"
```

#### Remove Addition CVM

Use the `<CVM_ID>` obtained during CVM creation.

```bash
./build/cocos-cli remove-vm <CVM_ID>
```

Expected output:

```bash
🔗 Connected to manager using  without TLS
🔗 Removing virtual machine
✅ Virtual machine removed successfully
```

### With Datasets (Iris Prediction Example)

#### Build Iris Algorithm and Copy Dataset

1. Navigate to the ai/burn-algorithms directory:

   ```bash
   cd ../ai/burn-algorithms
   ```

2. Build the iris-cocos binary:

   ```bash
   cargo build --release --bin iris-cocos --features cocos
   ```

3. Copy the compiled binary to your cocos directory:

   ```bash
   cp ./target/release/iris-cocos ../../cocos/
   ```

4. Copy the Iris.csv dataset to your cocos directory:

   ```bash
   cp ./iris/datasets/Iris.csv ../../cocos/
   ```

#### Start CVMS for Iris Binary

From your cocos directory, start the CVMS server, specifying both the algorithm and the dataset:

```bash
cd cocos
HOST=<YOUR_HOST_IP> go run ./test/cvms/main.go -algo-path ./iris-cocos -public-key-path public.pem -attested-tls-bool false -data-paths ./Iris.csv
```

#### Create CVM and Setup Agent for Iris

Follow the same steps as in the previous section. Remember to note the new CVM ID.

#### Upload Iris Dataset

From your cocos directory:

```bash
./build/cocos-cli data ./Iris.csv ./private.pem
```

Expected output:

```bash
🔗 Connected to agent  without TLS
Uploading dataset: ./Iris.csv
📦 Uploading data [██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                               
Successfully uploaded dataset! ✔ 
```

Watch the logs on the CVMS server for the computation to complete:

```bash
&{message:"Method Data took ... to complete without errors"  computation_id:"1"  level:"INFO"  timestamp:{...}}
&{event_type:"Running"  timestamp:{...}  computation_id:"1"  originator:"agent"  status:"Starting"}
&{event_type:"Running"  timestamp:{...}  computation_id:"1"  originator:"agent"  status:"Completed"}
&{event_type:"ConsumingResults"  timestamp:{...}  computation_id:"1"  originator:"agent"  status:"Ready"}
```

#### Download Iris Results

Follow the same step as in the previous section.

#### Extract and Test Iris Results

1. Unzip the results:

   ```bash
   unzip results.zip -d results
   ```

2. Create an artifacts folder and copy results:

   ```bash
   mkdir -p artifacts/iris
   cp -r results/* artifacts/iris/
   ```

3. Build the iris-inference example (from ai/burn-algorithms):

   ```bash
   cd ../ai/burn-algorithms/
   cargo build --release --bin iris-inference
   ```

4. Test the inference:

   ```bash
   ./target/release/iris-inference '{"sepal_length": 7.0, "sepal_width": 3.2, "petal_length": 4.7, "petal_width": 1.4}'
   ```

Expected output:

```bash
Iris-versicolor
```

#### Remove Iris CVM

Use the `<CVM_ID>` obtained during CVM creation.

```bash
./build/cocos-cli remove-vm <CVM_ID>
```

## Running Python Scripts

Python scripts can be executed within the enclave.

### With Datasets (Linear Regression Example)

#### Prepare Linear Regression Algorithm and Dataset

The example uses `lin_reg.py` and `iris.csv` from the cocos repository's test/manual directory. No separate build step is needed for Python scripts.

#### Start CVMS for Python Linear Regression

From your cocos directory, start the CVMS server, specifying the Python script and dataset:

```bash
cd cocos
HOST=<YOUR_HOST_IP> go run ./test/cvms/main.go -algo-path ./test/manual/algo/lin_reg.py -public-key-path public.pem -attested-tls-bool false -data-paths ./test/manual/data/iris.csv
```

#### Create CVM and Setup Agent for Python

Follow the same steps as described in the binary algorithms section.

#### Upload Python Algorithm and Requirements

From your cocos directory, upload the Python script and its requirements.txt:

```bash
./build/cocos-cli algo ./test/manual/algo/lin_reg.py ./private.pem -a python -r ./test/manual/algo/requirements.txt
```

#### Upload Python Dataset

From your cocos directory:

```bash
./build/cocos-cli data ./test/manual/data/iris.csv ./private.pem
```

Watch the Agent logs until the computation completes. This might take a while as dependencies are downloaded.

```bash
&{event_type:"algorithm-run" timestamp:{...} computation_id:"1" originator:"agent" status:"complete"}
&{event_type:"resultsReady" timestamp:{...} computation_id:"1" originator:"agent" status:"in-progress"}
```

#### Download Python Results

Follow the same step as described in the binary algorithms section.

#### Extract Python Results and Test Inference

1. Unzip the results:

   ```bash
   unzip results.zip -d results
   ```

2. Set up a Python virtual environment and install dependencies:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r test/manual/algo/requirements.txt
   ```

3. Run the prediction script:

   ```bash
   python3 test/manual/algo/lin_reg.py predict results/model.bin test/manual/data/
   ```

Expected output (showing precision, recall, and confusion matrix):

```bash
Precision, Recall, Confusion matrix, in training

                 precision    recall  f1-score   support

    Iris-setosa      1.000     1.000     1.000        21
Iris-versicolor      0.923     0.889     0.906        27
 Iris-virginica      0.893     0.926     0.909        27

       accuracy                          0.933        75
      macro avg      0.939     0.938     0.938        75
   weighted avg      0.934     0.933     0.933        75

[[21  0  0]
 [ 0 24  3]
 [ 0  2 25]]
Precision, Recall, and Confusion matrix, in testing

                 precision    recall  f1-score   support

    Iris-setosa      1.000     1.000     1.000        29
Iris-versicolor      1.000     1.000     1.000        23
 Iris-virginica      1.000     1.000     1.000        23

       accuracy                          1.000        75
      macro avg      1.000     1.000     1.000        75
   weighted avg      1.000     1.000     1.000        75

[[29  0  0]
 [ 0 23  0]
 [ 0  0 23]]
```

#### Remove Python CVM

Use the `<CVM_ID>` obtained during CVM creation.

```bash
./build/cocos-cli remove-vm <CVM_ID>
```

### Running Algorithms with Arguments

To pass command-line arguments to your algorithm, append them to the cocos-cli algo command using `--args`. The order of arguments matters.

**Example (Addition with Arguments):**

#### Prepare Addition Algorithm with Arguments

The example uses `addition.py` from `cocos/test/manual/algo/`.

#### Start CVMS for Python Addition

From your cocos directory:

```bash
cd cocos
HOST=192.168.1.100 go run ./test/cvms/main.go -algo-path ./test/manual/algo/addition.py -public-key-path public.pem -attested-tls-bool false
```

#### Create CVM and Setup Agent for Python Addition

Follow the same steps as described in the binary algorithms section.

#### Upload Python Addition Algorithm with Arguments

From your cocos directory:

```bash
./build/cocos-cli algo ./test/manual/algo/addition.py ./private.pem -a python --args="--a" --args="100" --args="--b" --args="20"
```

This corresponds to running `python3 addition.py --a 100 --b 20`.

Watch the Agent logs until the computation completes.

#### Download Python Addition Results

Follow the same step as described in the binary algorithms section.

#### Remove Python Addition CVM

Use the `<CVM_ID>` obtained during CVM creation.

```bash
./build/cocos-cli remove-vm <CVM_ID>
```

## Running Docker Images

Docker containers package applications and their dependencies, ensuring consistent execution.

### Building the Docker Image

The Docker image must have a `/cocos` directory containing datasets and results subdirectories. The Agent will mount these directories inside the container. The Dockerfile must also specify the command to run.

**Example (Linear Regression Docker Image):**

1. Navigate to the Docker example directory in the cocos repository:

   ```bash
   cd cocos/test/manual/algo/
   ```

2. Build the Docker image and save it as a tar file:

   ```bash
   docker build -t linreg .
   docker save linreg > linreg.tar
   ```

### Running Docker

#### Start CVMS for Docker

From your cocos directory, start the CVMS server, specifying the Docker image tar file and the dataset:

```bash
cd cocos
HOST=192.168.1.100 go run ./test/cvms/main.go -algo-path ./test/manual/algo/linreg.tar -public-key-path public.pem -attested-tls-bool false -data-paths ./test/manual/data/iris.csv
```

#### Start Manager for Docker

Follow the same step as described in the initial setup section. You might need to adjust `MANAGER_QEMU_MEMORY_SIZE` for Docker images (e.g., `MANAGER_QEMU_MEMORY_SIZE=25G`).

```bash
cd cmd/manager
sudo \
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_QEMU_MEMORY_SIZE=25G \
MANAGER_GRPC_HOST=localhost \
MANAGER_GRPC_PORT=7002 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
go run main.go
```

#### Create CVM and Setup Agent for Docker

Follow the same steps as described in the binary algorithms section.

#### Upload Docker Algorithm

From your cocos directory:

```bash
./build/cocos-cli algo ./test/manual/algo/linreg.tar ./private.pem -a docker
```

#### Upload Docker Dataset

From your cocos directory:

```bash
./build/cocos-cli data ./test/manual/data/iris.csv ./private.pem
```

Watch the Agent logs for computation completion.

```bash
&{event_type:"algorithm-run" timestamp:{...} computation_id:"1" originator:"agent" status:"complete"}
&{event_type:"resultsReady" timestamp:{...} computation_id:"1" originator:"agent" status:"in-progress"}
```

#### Download Docker Results

Follow the same step as described in the binary algorithms section.

#### Extract Docker Results and Test Inference

1. Unzip the results:

   ```bash
   unzip results.zip -d results
   ```

2. Perform inference (assuming you have the necessary Python environment set up as in the Python section):

   ```bash
   python3 test/manual/algo/lin_reg.py predict results/model.bin test/manual/data/
   ```

#### Remove Docker CVM

Use the `<CVM_ID>` obtained during CVM creation.

```bash
./build/cocos-cli remove-vm <CVM_ID>
```

## Running WebAssembly (Wasm) Modules

Wasm modules are a portable binary format suitable for secure enclave execution.

### Running WASM Algorithms (Addition Example)

#### Build the WASM Addition Module

1. Navigate to the ai/burn-algorithms/addition-inference directory:

   ```bash
   cd ../ai/burn-algorithms/addition-inference
   ```

2. Build the Wasm module:

   ```bash
   cargo build --release --target wasm32-wasip1 --features cocos
   ```

3. Copy the compiled Wasm module to your cocos directory:

   ```bash
   cp ../target/wasm32-wasip1/release/addition-inference.wasm ../../../cocos
   ```

#### Start CVMS for WASM

From your cocos directory, start the CVMS server, specifying the Wasm module:

```bash
cd cocos
HOST=192.168.1.100 go run ./test/cvms/main.go -algo-path ./addition-inference.wasm -public-key-path public.pem -attested-tls-bool false
```

#### Create CVM and Setup Agent for WASM

Follow the same steps as described in the binary algorithms section.

#### Upload WASM Algorithm

From your cocos directory:

```bash
./build/cocos-cli algo ./addition-inference.wasm ./private.pem -a wasm
```

Since this is a Wasm module and the addition example, no requirements file or dataset upload is needed.

#### Download WASM Results

Follow the same step as described in the binary algorithms section.

#### View WASM Results

```bash
unzip results.zip -d results
cat results/results.txt
```

Expected output:

```bash
"[5.141593, 4.0, 5.0, 8.141593]"
```

#### Remove WASM CVM

Use the `<CVM_ID>` obtained during CVM creation.

```bash
./build/cocos-cli remove-vm <CVM_ID>
```

For more real-world examples and algorithms, refer to the [AI repository](https://github.com/ultravioletrs/ai).
