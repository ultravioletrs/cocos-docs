# Tutorials

Currently, cocos supports running the following algorithms:

- binary algorithms
- python scripts
- docker images
- wasm modules

## Binary Algorithms

Binary algorithms are compiled to run on the enclave. The enclave is a secure environment that runs on the host machine. The enclave is created by the manager and the agent is loaded into the enclave. The agent is responsible for running the computation and communicating with the outside world.

### Running Binary Algorithms

For Binary algorithms, with datatsets or without datasets the process is similar to all the other algorithms.

NOTE: Make sure you have terminated the previous computation before starting a new one.

#### Download Examples

Download the examples from the [AI repository](https://github.com/ultravioletrs/ai) and follow the [instructions in the README file](https://github.com/ultravioletrs/ai/blob/main/burn-algorithms/COCOS.md) to compile one of the examples.

```bash
git clone https://github.com/ultravioletrs/ai
```

#### Build Addition example

Make sure you have Rust installed. If not, you can install it by following the instructions [here](https://www.rust-lang.org/tools/install).

```bash
cd ai/burn-algorithms
```

NOTE: Make sure you have rust installed. If not, you can install it by following the instructions [here](https://www.rust-lang.org/tools/install).

```bash
cargo build --release --bin addition-cocos --features cocos
```

This will generate the binary in the `target/release` folder. Copy the binary to the `cocos` folder.

```bash
cp ./target/release/addition-cocos ../../cocos
```

#### Finding Your IP Address

When running the CVMS server, make sure to use an IP address that is reachable from the virtual machine — rather than using localhost. To determine your host machine's IP address, you can run:

```bash
ip a
```

Look for your network interface (such as wlan0 for WiFi or eth0 for Ethernet) and note the IP address. For example:

```bash
2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 12:34:56:78:9a:bc brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic noprefixroute wlan0
```

In this example, the IP address is 192.168.1.100. This address should be used both when launching the CVMS server and when configuring the CVM using the manager tool.

Start the computation management server: in cocos repo

```bash
cd cocos
HOST=192.168.1.100 go run ./test/cvms/main.go -algo-path ./addition-cocos -public-key-path public.pem -attested-tls-bool false
```

The logs will be similar to this:

```bash
{"time":"2025-07-28T17:33:28.698759564+03:00","level":"INFO","msg":"cvms_test_server service gRPC server listening at 192.168.1.100:7001 without TLS"}
```

Start the manager in cocos repo

```bash
cd cmd/manager
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

The logs will be similar to this:

```bash
{"time":"2025-07-28T17:38:57.991245143+03:00","level":"INFO","msg":"Manager started without confidential computing support"}
{"time":"2025-07-28T17:38:57.991298303+03:00","level":"INFO","msg":"-enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=4 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/usr/share/edk2/x64/OVMF_VARS.fd -netdev user,id=vmnic,hostfwd=tcp::7020-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -kernel img/bzImage -append \"quiet console=null\" -initrd img/rootfs.cpio.gz -nographic -monitor pty"}
{"time":"2025-07-28T17:38:57.991433769+03:00","level":"INFO","msg":"manager service gRPC server listening at localhost:7002 without TLS"}
```

##### Create a cvm

To create a cvm we'll need the host address used to start the cvms server. An example is shown below:

```bash
export MANAGER_GRPC_URL=localhost:7002
./build/cocos-cli create-vm --log-level debug --server-url "192.168.1.100:7001"
```

When the cvm boots, it will connect to the cvms server and receive a computation manifest. Once started agent will send back events and logs.

The output on the cvms test server will be similar to this:

```bash
🔗 Connected to manager using  without TLS
🔗 Creating a new virtual machine
✅ Virtual machine created successfully with id 31f39ac9-d2d3-4df6-96fa-e42556a07c24 and port 6100
```

The logs from the computation server will be similar to this:

```bash
&{message:"Method InitComputation for computation id 1 took 6.672µs to complete without errors"  computation_id:"1"  level:"INFO"  timestamp:{seconds:1753713974  nanos:117043605}}
&{computation_id:"1"}
&{event_type:"ReceivingAlgorithm"  timestamp:{seconds:1753713974  nanos:117142321}  computation_id:"1"  originator:"agent"  status:"InProgress"}
&{message:"agent service gRPC server listening at 10.0.2.15:7002 without TLS"  computation_id:"1"  level:"INFO"  timestamp:{seconds:1753713974  nanos:117232905}}
```

Export the agent grpc url

```bash
export AGENT_GRPC_URL=localhost:6100
```

Upload the algorithm

```bash
./build/cocos-cli algo ./addition-cocos ./private.pem
```

The logs will be similar to this:

```bash
🔗 Connected to agent  without TLS
Uploading algorithm file: ./addition-cocos
🚀 Uploading algorithm [█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                             
Successfully uploaded algorithm! ✔ 
```

Since the algorithm is a binary, we don't need to upload the requirements file. Also, this is the addition example so we don't need to upload the dataset.

Finally, download the results

```bash
./build/cocos-cli result ./private.pem
```

The logs will be similar to this:

```bash
🔗 Connected to agent  without TLS
⏳ Retrieving computation result file
📥 Downloading result [██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                             
Computation result retrieved and saved successfully as results.zip! ✔ 
```

Unzip the results

```bash
unzip results.zip -d results
```

```bash
cat results/results.txt
```

The output will be similar to this:

```bash
"[5.141593, 4.0, 5.0, 8.141593]"
```

#### Remove cvm

```bash
./build/cocos-cli remove-vm 31f39ac9-d2d3-4df6-96fa-e42556a07c24
```

the output will be

```bash
🔗 Connected to manager using  without TLS
🔗 Removing virtual machine
✅ Virtual machine removed successfully
```

For real-world examples to test with cocos, see our [AI repository](https://github.com/ultravioletrs/ai).

### Running Binary Algorithms With Datasets

NOTE: Make sure you have terminated the previous computation before starting a new one.

#### Build Iris Prediction example

Make sure you have Rust installed. If not, you can install it by following the instructions [here](https://www.rust-lang.org/tools/install).

```bash
cd ai/burn-algorithms
```

NOTE: Make sure you have rust installed. If not, you can install it by following the instructions [here](https://www.rust-lang.org/tools/install).

```bash
cargo build --release --bin iris-cocos --features cocos
```

This will generate the binary in the `target/release` folder. Copy the binary to the `cocos` folder.

```bash
cp ./target/release/iris-cocos ../../cocos/
```

Copy the dataset to the `cocos` folder.

```bash
cp ./iris/datasets/Iris.csv ../../cocos/
```

#### Finding Your IP Address

When running the CVMS server, make sure to use an IP address that is reachable from the virtual machine — rather than using localhost. To determine your host machine's IP address, you can run:

```bash
ip a
```

Look for your network interface (such as wlan0 for WiFi or eth0 for Ethernet) and note the IP address. For example:

```bash
2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 12:34:56:78:9a:bc brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic noprefixroute wlan0
```

In this example, the IP address is 192.168.1.100. This address should be used both when launching the CVMS server and when configuring the CVM using the manager tool.

Start the computation management server: in cocos repo

```bash
cd cocos
HOST=192.168.1.100 go run ./test/cvms/main.go -algo-path ./iris-cocos -public-key-path public.pem -attested-tls-bool false -data-paths ./Iris.csv
```

The logs will be similar to this:

```bash
{"time":"2025-07-28T17:33:28.698759564+03:00","level":"INFO","msg":"cvms_test_server service gRPC server listening at 192.168.1.100:7001 without TLS"}
```

Start the manager in cocos repo

```bash
cd cmd/manager
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

The logs will be similar to this:

```bash
{"time":"2025-07-28T17:38:57.991245143+03:00","level":"INFO","msg":"Manager started without confidential computing support"}
{"time":"2025-07-28T17:38:57.991298303+03:00","level":"INFO","msg":"-enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=4 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/usr/share/edk2/x64/OVMF_VARS.fd -netdev user,id=vmnic,hostfwd=tcp::7020-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -kernel img/bzImage -append \"quiet console=null\" -initrd img/rootfs.cpio.gz -nographic -monitor pty"}
{"time":"2025-07-28T17:38:57.991433769+03:00","level":"INFO","msg":"manager service gRPC server listening at localhost:7002 without TLS"}
```

##### Create a cvm

To create a cvm we'll need the host address used to start the cvms server. An example is shown below:

```bash
export MANAGER_GRPC_URL=localhost:7002
./build/cocos-cli create-vm --log-level debug --server-url "192.168.1.100:7001"
```

When the cvm boots, it will connect to the cvms server and receive a computation manifest. Once started agent will send back events and logs.

The output on the cvms test server will be similar to this:

```bash
🔗 Connected to manager using  without TLS
🔗 Creating a new virtual machine
✅ Virtual machine created successfully with id 6e0a7570-6fdd-46c8-a29c-7fe83a50c85d and port 6100
```

The logs from the computation server will be similar to this:

```bash
&{message:"Method InitComputation for computation id 1 took 3.454µs to complete without errors"  computation_id:"1"  level:"INFO"  timestamp:{seconds:1753716887  nanos:223994412}}
&{event_type:"ReceivingAlgorithm"  timestamp:{seconds:1753716887  nanos:224047068}  computation_id:"1"  originator:"agent"  status:"InProgress"}
&{computation_id:"1"}
&{message:"agent service gRPC server listening at 10.0.2.15:7002 without TLS"  computation_id:"1"  level:"INFO"  timestamp:{seconds:1753716887  nanos:224294224}}
```

Export the agent grpc url

```bash
export AGENT_GRPC_URL=localhost:6100
```

Upload the algorithm

```bash
./build/cocos-cli algo ./iris-cocos ./private.pem
```

The logs will be similar to this:

```bash
🔗 Connected to agent  without TLS
Uploading algorithm file: ./iris-cocos
🚀 Uploading algorithm [█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                             
Successfully uploaded algorithm! ✔
```

Upload the dataset

```bash
./build/cocos-cli data ./Iris.csv ./private.pem
```

```bash
./build/cocos-cli data ./Iris.csv ./private.pem                                                                                                                                                                                     ✔ 
🔗 Connected to agent  without TLS
Uploading dataset: ./Iris.csv
📦 Uploading data [██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                             
Successfully uploaded dataset! ✔ 
```

watch the logs on the computation management server for the computation to complete running

```bash
&{message:"Method Data took 95.32µs to complete without errors"  computation_id:"1"  level:"INFO"  timestamp:{seconds:1753716988  nanos:66773209}}
&{event_type:"Running"  timestamp:{seconds:1753716988  nanos:66836101}  computation_id:"1"  originator:"agent"  status:"Starting"}
&{message:"computation run started"  computation_id:"1"  level:"DEBUG"  timestamp:{seconds:1753716988  nanos:66876532}}
&{event_type:"Running"  timestamp:{seconds:1753716988  nanos:66947688}  computation_id:"1"  originator:"agent"  status:"InProgress"}
&{event_type:"Running"  timestamp:{seconds:1753716988  nanos:119592681}  computation_id:"1"  originator:"agent"  status:"Completed"}
&{event_type:"ConsumingResults"  timestamp:{seconds:1753716988  nanos:120457634}  computation_id:"1"  originator:"agent"  status:"Ready"}
```

Finally, download the results

```bash
./build/cocos-cli result ./private.pem
```

The logs will be similar to this:

```bash
🔗 Connected to agent  without TLS
⏳ Retrieving computation result file
📥 Downloading result [██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                             
Computation result retrieved and saved successfully as results.zip! ✔
```

Unzip the results

```bash
unzip results.zip -d results
```

Build the iris example from the [AI repository](https://github.com/ultravioletrs/ai/tree/main/burn-algorithms)

```bash
cd ../ai/burn-algorithms/
```

If you haven't already, create the artifacts folder

```bash
mkdir -p artifacts/iris
```

Copy the results to the artifacts folder

```bash
cp -r ../../cocos/results/* artifacts/iris/
```

Build the iris-inference example

```bash
cargo build --release --bin iris-inference
```

Test the iris-inference example

```bash
./target/release/iris-inference '{"sepal_length": 7.0, "sepal_width": 3.2, "petal_length": 4.7, "petal_width": 1.4}'
```

The output will be similar to this:

```bash
Iris-versicolor
```

#### Remove cvm

```bash
./build/cocos-cli remove-vm 6e0a7570-6fdd-46c8-a29c-7fe83a50c85d
```

the output will be

```bash
🔗 Connected to manager using  without TLS
🔗 Removing virtual machine
✅ Virtual machine removed successfully
```

For real-world examples to test with cocos, see our [AI repository](https://github.com/ultravioletrs/ai).

## Python Scripts

Python is a high-level, interpreted programming language. Python scripts can be run on the enclave. Python is known for its simplicity and readability, making it a popular choice for beginners and experienced developers alike.

### Running Python Algorithms without Datasets

This has been covered in the [previous section](./getting-started.md#uploading-assets).

### Running Python Algorithms with Datasets

For Python algorithms, with datatsets:

NOTE: Make sure you have terminated the previous computation before starting a new one.

#### Finding Your IP Address

When running the CVMS server, make sure to use an IP address that is reachable from the virtual machine — rather than using localhost. To determine your host machine's IP address, you can run:

```bash
ip a
```

Look for your network interface (such as wlan0 for WiFi or eth0 for Ethernet) and note the IP address. For example:

```bash
2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 12:34:56:78:9a:bc brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic noprefixroute wlan0
```

In this example, the IP address is 192.168.1.100. This address should be used both when launching the CVMS server and when configuring the CVM using the manager tool.

Start the computation management server: in cocos repo

```bash
cd cocos
HOST=192.168.1.100 go run ./test/cvms/main.go -algo-path ./test/manual/algo/lin_reg.py -public-key-path public.pem -attested-tls-bool false -data-paths ./test/manual/data/iris.csv
```

Start the manager in cocos repo

```bash
cd cmd/manager
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

##### Create a cvm

To create a cvm we'll need the host address used to start the cvms server. An example is shown below:

```bash
export MANAGER_GRPC_URL=localhost:7002
./build/cocos-cli create-vm --log-level debug --server-url "192.168.1.100:7001"
```

Export the agent grpc url from the cvm creation output, by default port 6100 will be allocated. If the port is not available, a different (random) port will be allocated, within the range 6100 - 6200. The port will be indicated in the cvm creation output.

```bash
export AGENT_GRPC_URL=localhost:6100
```

Upload the algorithm

```bash
./build/cocos-cli algo ./test/manual/algo/lin_reg.py ./private.pem -a python -r ./test/manual/algo/requirements.txt
```

We pass the requirements file to the algorithm since it has dependencies.

Upload the dataset

```bash
./build/cocos-cli data ./test/manual/data/iris.csv ./private.pem
```

Watch the agent logs until the computation is complete. The computation will take a while to complete since it will download the dependencies and run the algorithm.

```bash
&{event_type:"algorithm-run" timestamp:{seconds:1753713974 nanos:935138750} computation_id:"1" originator:"agent" status:"complete"}
received agent event
&{event_type:"resultsReady" timestamp:{seconds:1753713975 nanos:882446542} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"Transition: resultsReady -> resultsReady\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1753713975 nanos:882432675}}
```

Finally, download the results

```bash
./build/cocos-cli result ./private.pem
```

Unzip the results

```bash
unzip results.zip -d results
```

To read the results make sure you have installed the required dependencies from the requirements file. This should be done inside a virtual environment.

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r test/manual/algo/requirements.txt
```

```bash
python3 test/manual/algo/lin_reg.py predict results/model.bin  test/manual/data/
```

The output will be similar to this:

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

#### Remove cvm

```bash
./build/cocos-cli remove-vm 31f39ac9-d2d3-4df6-96fa-e42556a07c24
```

the output will be

```bash
🔗 Connected to manager using  without TLS
🔗 Removing virtual machine
✅ Virtual machine removed successfully
```

For real-world examples to test with cocos, see our [AI repository](https://github.com/ultravioletrs/ai).

## Running Algorithms with arguments

To run an algorithm that requires command line arguments, you can append the algo command on cli with the arguments needed as shown in the addition example, which we will run with args below:

NOTE: Make sure you have terminated the previous computation before starting a new one.

#### Finding Your IP Address

When running the CVMS server, make sure to use an IP address that is reachable from the virtual machine — rather than using localhost. To determine your host machine's IP address, you can run:

```bash
ip a
```

Look for your network interface (such as wlan0 for WiFi or eth0 for Ethernet) and note the IP address. For example:

```bash
2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 12:34:56:78:9a:bc brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic noprefixroute wlan0
```

In this example, the IP address is 192.168.1.100. This address should be used both when launching the CVMS server and when configuring the CVM using the manager tool.

Start the computation management server: in cocos repo

```bash
cd cocos
HOST=192.168.1.100 go run ./test/cvms/main.go -algo-path ./test/manual/algo/addition.py -public-key-path public.pem -attested-tls-bool false
```

Start the manager in cocos repo

```bash
cd cmd/manager
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

##### Create a cvm

To create a cvm we'll need the host address used to start the cvms server. An example is shown below:

```bash
export MANAGER_GRPC_URL=localhost:7002
./build/cocos-cli create-vm --log-level debug --server-url "192.168.1.100:7001"
```

Export the agent grpc url from the cvm creation output, by default port 6100 will be allocated. If the port is not available, a different (random) port will be allocated, within the range 6100 - 6200. The port will be indicated in the cvm creation output.

```bash
export AGENT_GRPC_URL=localhost:6100
```

Upload the algorithm

```bash
./build/cocos-cli algo ./test/manual/algo/addition.py ./private.pem -a python --args="--a" --args="100" --args="--b" --args="20"
```

The order and args of the algorithm should be as they are required by the algorithm. In the addition example, for instance, the args are set in order of how they are expected:

```bash
python3 addition.py --a 100 --b 200
```

Watch the agent logs until the computation is complete.

```bash
&{event_type:"algorithm-run" timestamp:{seconds:1753713974 nanos:935138750} computation_id:"1" originator:"agent" status:"complete"}
received agent event
&{event_type:"resultsReady" timestamp:{seconds:1753713975 nanos:882446542} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"Transition: resultsReady -> resultsReady\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1753713975 nanos:882432675}}
```

Finally, download the results

```bash
./build/cocos-cli result ./private.pem
```

#### Remove cvm

```bash
./build/cocos-cli remove-vm 31f39ac9-d2d3-4df6-96fa-e42556a07c24
```

the output will be

```bash
🔗 Connected to manager using  without TLS
🔗 Removing virtual machine
✅ Virtual machine removed successfully
```

## Docker

Docker is a platform designed to build, share, and run containerized applications. A container packages the application code, runtime, system tools, libraries, and all necessary settings into a single unit. This ensures the container can be reliably transferred between different computing environments and be executed as expected.

### Building The Docker Image

The Docker images that the Agent will run inside the SVM must have some restrictions. The image must have a `/cocos` directory containing the `datasets` and `results` directories. The Agent will run this image inside the SVM and mount the `datasets` and `results` onto the `/cocos/datasets` and `/cocos/results` directories inside the image. The docker image must also contain the command that will be run when the docker container is run.

We will use the linear regression example from the cocos repository in this example.

```bash
git clone https://github.com/ultravioletrs/cocos.git
```

Change directory to the linear regression example.

```bash
cd cocos/test/manual/algo/
```

Next, run the build command and save the docker image as a `tar` file. This example Dockerfile is based of the python linear regression example using iris dataset.

```bash
docker build -t linreg .
docker save linreg > linreg.tar
```

### Running Docker in SVM

Change the current working directory to `cocos`.

```bash
cd ./cocos
```

#### Finding Your IP Address

When running the CVMS server, make sure to use an IP address that is reachable from the virtual machine — rather than using localhost. To determine your host machine's IP address, you can run:

```bash
ip a
```

Look for your network interface (such as wlan0 for WiFi or eth0 for Ethernet) and note the IP address. For example:

```bash
2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 12:34:56:78:9a:bc brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic noprefixroute wlan0
```

In this example, the IP address is 192.168.1.100. This address should be used both when launching the

Start the computation management server:

```bash
HOST=192.168.1.100 go run ./test/cvms/main.go -algo-path ./test/manual/algo/linreg.tar -public-key-path public.pem -attested-tls-bool false -data-paths ./test/manual/data/iris.csv
```

Start the manager

```bash
cd cmd/manager
```

```bash
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

##### Create a cvm

To create a cvm we'll need the host address used to start the cvms server. An example is shown below:

```bash
export MANAGER_GRPC_URL=localhost:7002
./build/cocos-cli create-vm --log-level debug --server-url "192.168.1.100:7001"
```

Export the agent grpc url

```bash
export AGENT_GRPC_URL=localhost:6100
```

Upload the algorithm

```bash
./build/cocos-cli algo ./test/manual/algo/linreg.tar ./private.pem -a docker
```

Upload the dataset

```bash
./build/cocos-cli data ./test/manual/data/iris.csv ./private.pem
```

After some time when the results are ready, you can run the following command to get the results:

```bash
&{event_type:"algorithm-run" timestamp:{seconds:1753713974 nanos:935138750} computation_id:"1" originator:"agent" status:"complete"}
received agent event
&{event_type:"resultsReady" timestamp:{seconds:1753713975 nanos:882446542} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"Transition: resultsReady -> resultsReady\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1753713975 nanos:882432675}}
```

```bash
./build/cocos-cli result ./private.pem
```

The logs will be similar to this:

```bash
🔗 Connected to agent  without TLS
⏳ Retrieving computation result file
📥 Downloading result [██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] [100%]                             
Computation result retrieved and saved successfully as results.zip! ✔ 
```

Unzip the results

```bash
unzip results.zip -d results
```

To make inference on the results, you can use the following command:

```bash
python3 test/manual/algo/lin_reg.py predict results/model.bin  test/manual/data/
```

#### Remove cvm

```bash
./build/cocos-cli remove-vm 31f39ac9-d2d3-4df6-96fa-e42556a07c24
```

the output will be

```bash
🔗 Connected to manager using  without TLS
🔗 Removing virtual machine
✅ Virtual machine removed successfully
```

## Wasm Modules

WebAssembly (wasm) is a binary instruction format for a stack-based virtual machine. Wasm is designed as a portable target for compilation of high-level languages like C/C++/Rust, enabling deployment on the web for client and server applications. Wasm modules can be run on the enclave.

### Running WASM Algorithms

NOTE: Make sure you have terminated the previous computation before starting a new one.

#### Download WASM Examples

Download the examples from the [AI repository](https://github.com/ultravioletrs/ai) and follow the [instructions in the README file](https://github.com/ultravioletrs/ai/blob/main/burn-algorithms/COCOS.md) to compile one of the examples.

```bash
git clone https://github.com/ultravioletrs/ai
```

#### Build Addition WASM example

Make sure you have Rust installed. If not, you can install it by following the instructions [here](https://www.rust-lang.org/tools/install).

```bash
cd ai/burn-algorithms/addition-inference
```

```bash
cargo build --release --target wasm32-wasip1 --features cocos
```

This will generate the wasm module in the `../target/wasm32-wasip1/release` folder. Copy the module to the `cocos` folder.

```bash
cp ../target/wasm32-wasip1/release/addition-inference.wasm ../../../cocos
```

#### Finding Your IP Address

When running the CVMS server, make sure to use an IP address that is reachable from the virtual machine — rather than using localhost. To determine your host machine's IP address, you can run:

```bash
ip a
```

Look for your network interface (such as wlan0 for WiFi or eth0 for Ethernet) and note the IP address. For example:

```bash
2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 12:34:56:78:9a:bc brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic noprefixroute wlan0
```

In this example, the IP address is 192.168.1.100. This address should be used both when launching the

Start the computation server:

```bash
HOST=192.168.100.4 go run ./test/cvms/main.go -algo-path ./addition-inference.wasm -public-key-path public.pem -attested-tls-bool false
```

Start the manager

```bash
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

##### Create a cvm

To create a cvm we'll need the host address used to start the cvms server. An example is shown below:

```bash
export MANAGER_GRPC_URL=localhost:7002
./build/cocos-cli create-vm --log-level debug --server-url "192.168.1.100:7001"
```

Export the agent grpc url

```bash
export AGENT_GRPC_URL=localhost:6100
```

Upload the algorithm

```bash
./build/cocos-cli algo ./addition-inference.wasm ./private.pem -a wasm
```

Since the algorithm is a wasm module, we don't need to upload the requirements file. Also, this is the addition example so we don't need to upload the dataset.

Finally, download the results

```bash
./build/cocos-cli result ./private.pem
```

Unzip the results

```bash
unzip results.zip -d results
```

```bash
cat results/results/results.txt
```

The output will be similar to this:

```bash
"[5.141593, 4.0, 5.0, 8.141593]"
```

#### Remove cvm

```bash
./build/cocos-cli remove-vm 31f39ac9-d2d3-4df6-96fa-e42556a07c24
```

the output will be

```bash
🔗 Connected to manager using  without TLS
🔗 Removing virtual machine
✅ Virtual machine removed successfully
```

For real-world examples to test with cocos, see our [AI repository](https://github.com/ultravioletrs/ai).
