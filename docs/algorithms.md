# Algorithms

Currently, cocos supports running the following algorithms:

- binary algorithms
- python scripts
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
cargo build --release --bin addition --features cocos
```

This will generate the binary in the `target/release` folder. Copy the binary to the `cocos` folder.

```bash
cp target/release/addition ../../cocos/
```

Start the computation server:

```bash
go run ./test/computations/main.go ./addition public.pem false
```

The logs will be similar to this:

```bash
{"time":"2024-08-19T14:09:28.852409931+03:00","level":"INFO","msg":"manager_test_server service gRPC server listening at :7001 without TLS"}
```

Start the manager

```bash
sudo \
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_GRPC_URL=localhost:7001 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
go run main.go
```

The logs will be similar to this:

```bash
{"time":"2024-08-19T14:10:00.239331599+03:00","level":"INFO","msg":"-enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=4 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/usr/share/edk2/x64/OVMF_VARS.fd -netdev user,id=vmnic,hostfwd=tcp::7020-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -vnc :0 -kernel img/bzImage -append \"earlyprintk=serial console=ttyS0\" -initrd img/rootfs.cpio.gz -nographic -monitor pty"}
{"time":"2024-08-19T14:10:17.798497671+03:00","level":"INFO","msg":"Method Run for computation took 17.438247421s to complete"}
{"time":"2024-08-19T14:10:17.800162858+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Transition: receivingManifest -> receivingManifest\\n\"  computation_id:\"1\"  level:\"DEBUG\"  timestamp:{seconds:1724065817  nanos:796771386}}"}
{"time":"2024-08-19T14:10:17.800336232+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Transition: receivingAlgorithm -> receivingAlgorithm\\n\"  computation_id:\"1\"  level:\"DEBUG\"  timestamp:{seconds:1724065817  nanos:797222579}}"}
{"time":"2024-08-19T14:10:17.80043386+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_event:{event_type:\"receivingAlgorithm\"  timestamp:{seconds:1724065817  nanos:797263757}  computation_id:\"1\"  originator:\"agent\" status:\"in-progress\"}"}
{"time":"2024-08-19T14:10:17.8005587+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"agent service gRPC server listening at :7002 without TLS\"  computation_id:\"1\"  level:\"INFO\"  timestamp:{seconds:1724065817  nanos:797467753}}"}
2024/08/19 14:10:20 traces export: Post "http://localhost:4318/v1/traces": dial tcp [::1]:4318: connect: connection refused
```

The logs from the computation server will be similar to this:

```bash
{"time":"2024-08-19T14:09:28.852409931+03:00","level":"INFO","msg":"manager_test_server service gRPC server listening at :7001 without TLS"}
{"time":"2024-08-19T14:10:00.354929002+03:00","level":"DEBUG","msg":"received who am on ip address [::1]:57968"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1724065800 nanos:360232336} computation_id:"1" originator:"manager" status:"starting"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1724065800 nanos:360990806} computation_id:"1" originator:"manager" status:"in-progress"}
received agent log
&{message:"char device redirected to /dev/pts/9 (label compat_monitor0)\n" computation_id:"1" level:"debug" timestamp:{seconds:1724065800 nanos:403232551}}
received agent log
&{message:"\x1b[2J" computation_id:"1" level:"debug" timestamp:{seconds:1724065801 nanos:103436975}}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1724065817 nanos:798465068} computation_id:"1" originator:"manager" status:"complete"}
received runRes
&{agent_port:"6050" computation_id:"1"}
received agent log
&{message:"Transition: receivingManifest -> receivingManifest\n" computation_id: "1" level:"DEBUG" timestamp:{seconds:1724065817 nanos:796771386}}
received agent log
&{message:"Transition: receivingAlgorithm -> receivingAlgorithm\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1724065817 nanos:797222579}}
received agent event
&{event_type:"receivingAlgorithm" timestamp:{seconds:1724065817 nanos:797263757} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"agent service gRPC server listening at :7002 without TLS" computation_id:"1" level:"INFO" timestamp:{seconds:1724065817 nanos:797467753}}
```

Export the agent grpc url

```bash
export AGENT_GRPC_URL=localhost:6050
```

Upload the algorithm

```bash
./build/cocos-cli algo ./addition ./private.pem
```

The logs will be similar to this:

```bash
2024/08/19 14:14:10 Uploading algorithm binary: ./addition
Uploading algorithm...  100% [===============================================>]
2024/08/19 14:14:10 Successfully uploaded algorithm
```

Since the algorithm is a binary, we don't need to upload the requirements file. Also, this is the addition example so we don't need to upload the dataset.

Finally, download the results

```bash
./build/cocos-cli result ./private.pem
```

The logs will be similar to this:

```bash
2024/08/19 14:14:31 Retrieving computation result file
2024/08/19 14:14:31 Computation result retrieved and saved successfully!
```

Unzip the results

```bash
unzip result.zip -d results
```

```bash
cat results/results.txt
```

The output will be similar to this:

```bash
"[5.141593, 4.0, 5.0, 8.141593]"
```

Terminal recording session

[![asciicast](https://asciinema.org/a/HsMDuJT4lMs2BQLqCbvTiGzNe.svg)](https://asciinema.org/a/HsMDuJT4lMs2BQLqCbvTiGzNe)

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
cargo build --release --bin iris --features cocos
```

This will generate the binary in the `target/release` folder. Copy the binary to the `cocos` folder.

```bash
cp target/release/iris ../../cocos/
```

Copy the dataset to the `cocos` folder.

```bash
cp iris/data/Iris.csv ../../cocos
```

Start the computation server:

```bash
go run ./test/computations/main.go ./iris public.pem false ./Iris.csv
```

The logs will be similar to this:

```bash
{"time":"2024-08-19T14:26:11.446590856+03:00","level":"INFO","msg":"manager_test_server service gRPC server listening at :7001 without TLS"}
```

Start the manager

```bash
sudo \
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_GRPC_URL=localhost:7001 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
go run main.go
```

The logs will be similar to this:

```bash
{"time":"2024-08-19T14:26:20.869571321+03:00","level":"INFO","msg":"-enable-kvm -machine q35 -cpu EPYC -smp 4,maxcpus=4 -m 2048M,slots=5,maxmem=30G -drive if=pflash,format=raw,unit=0,file=/usr/share/edk2/x64/OVMF_CODE.fd,readonly=on -drive if=pflash,format=raw,unit=1,file=/usr/share/edk2/x64/OVMF_VARS.fd -netdev user,id=vmnic,hostfwd=tcp::7020-:7002 -device virtio-net-pci,disable-legacy=on,iommu_platform=true,netdev=vmnic,addr=0x2,romfile= -device vhost-vsock-pci,id=vhost-vsock-pci0,guest-cid=3 -vnc :0 -kernel img/bzImage -append \"earlyprintk=serial console=ttyS0\" -initrd img/rootfs.cpio.gz -nographic -monitor pty"}
{"time":"2024-08-19T14:26:39.096019489+03:00","level":"INFO","msg":"Method Run for computation took 18.206099301s to complete"}
{"time":"2024-08-19T14:26:39.097590785+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"Transition: receivingManifest -> receivingManifest\\n\"  computation_id:\"1\"  level:\"DEBUG\"  timestamp:{seconds:1724066799  nanos:94341079}}"}
{"time":"2024-08-19T14:26:39.097907318+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_event:{event_type:\"receivingAlgorithm\"  timestamp:{seconds:1724066799  nanos:94599012}  computation_id:\"1\"  originator:\"agent\"  status:\"in-progress\"}"}
{"time":"2024-08-19T14:26:39.097933878+03:00","level":"INFO","msg":"Agent Log/Event, Computation ID: 1, Message: agent_log:{message:\"agent service gRPC server listening at :7002 without TLS\"  computation_id:\"1\"  level:\"INFO\"  timestamp:{seconds:1724066799  nanos:94831037}}"}
2024/08/19 14:26:40 traces export: Post "http://localhost:4318/v1/traces": dial tcp [::1]:4318: connect: connection refused
```

The logs from the computation server will be similar to this:

```bash
{"time":"2024-08-19T14:26:11.446590856+03:00","level":"INFO","msg":"manager_test_server service gRPC server listening at :7001 without TLS"}
{"time":"2024-08-19T14:26:20.871605244+03:00","level":"DEBUG","msg":"received who am on ip address [::1]:47994"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1724066780 nanos:889897585} computation_id:"1" originator:"manager" status:"starting"}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1724066780 nanos:891441319} computation_id:"1" originator:"manager" status:"in-progress"}
received agent log
&{message:"char device redirected to /dev/pts/8 (label compat_monitor0)\n" computation_id:"1" level:"debug" timestamp:{seconds:1724066780 nanos:935158505}}
received agent log
&{message:"\x1b[2" computation_id:"1" level:"debug" timestamp:{seconds:1724066781 nanos:414565103}}
received agent event
&{event_type:"vm-provision" timestamp:{seconds:1724066799 nanos:95970587} computation_id:"1" originator:"manager" status:"complete"}
received runRes
&{agent_port:"6014" computation_id:"1"}
received agent log
&{message:"Transition: receivingManifest -> receivingManifest\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1724066799 nanos:94341079}}
received agent event
&{event_type:"receivingAlgorithm" timestamp:{seconds:1724066799 nanos:94599012} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"agent service gRPC server listening at :7002 without TLS" computation_id:"1" level:"INFO" timestamp:{seconds:1724066799 nanos:94831037}}
```

Export the agent grpc url

```bash
export AGENT_GRPC_URL=localhost:6014
```

Upload the algorithm

```bash
./build/cocos-cli algo ./iris ./private.pem
```

The logs will be similar to this:

```bash
2024/08/19 14:29:58 Uploading algorithm binary: ./iris
Uploading algorithm...  100% [===============================================>]
2024/08/19 14:29:58 Successfully uploaded algorithm
```

Upload the dataset

```bash
./build/cocos-cli data ./Iris.csv ./private.pem
```

```bash
2024/08/19 14:30:55 Uploading dataset CSV: ./Iris.csv
Uploading data...  100% [====================================================>]
2024/08/19 14:30:55 Successfully uploaded dataset
```

Finally, download the results

```bash
./build/cocos-cli result ./private.pem
```

The logs will be similar to this:

```bash
2024/08/19 14:31:46 Retrieving computation result file
2024/08/19 14:31:46 Computation result retrieved and saved successfully!
```

Unzip the results

```bash
unzip result.zip -d results
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

Terminal recording session

[![asciicast](https://asciinema.org/a/qQl6O4xZKzavbzMwsDT3pM6d7.svg)](https://asciinema.org/a/qQl6O4xZKzavbzMwsDT3pM6d7)

For real-world examples to test with cocos, see our [AI repository](https://github.com/ultravioletrs/ai).

## Python Scripts

Python is a high-level, interpreted programming language. Python scripts can be run on the enclave. Python is known for its simplicity and readability, making it a popular choice for beginners and experienced developers alike.

## Running Python Algorithms without Datasets

This has been covered in the [previous section](./getting-started.md#uploading-artefacts).

## Running Python Algorithms with Datasets

For Python algorithms, with datatsets:

NOTE: Make sure you have terminated the previous computation before starting a new one.

Start the computation server:

```bash
go run ./test/computations/main.go ./test/manual/algo/lin_reg.py public.pem false ./test/manual/data/iris.csv
```

Start the manager

```bash
sudo \
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_GRPC_URL=localhost:7001 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
go run main.go
```

Export the agent grpc url from computation server logs

```bash
export AGENT_GRPC_URL=localhost:6066
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
&{event_type:"algorithm-run" timestamp:{seconds:1723411516 nanos:935138750} computation_id:"1" originator:"agent" status:"error"}
received agent event
&{event_type:"resultsReady" timestamp:{seconds:1723411517 nanos:882446542} computation_id:"1" originator:"agent" status:"in-progress"}
received agent log
&{message:"Transition: resultsReady -> resultsReady\n" computation_id:"1" level:"DEBUG" timestamp:{seconds:1723411517 nanos:882432675}}
```

Finally, download the results

```bash
./build/cocos-cli result ./private.pem
```

Unzip the results

```bash
unzip result.zip -d results
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

Terminal recording session

[![asciicast](https://asciinema.org/a/GfFrNavHJ26ne09FjwvPDox4T.svg)](https://asciinema.org/a/GfFrNavHJ26ne09FjwvPDox4T)

For real-world examples to test with cocos, see our [AI repository](https://github.com/ultravioletrs/ai).

## Docker

Docker is a platform designed to build, share, and run containerized applications. A container packages the application code, runtime, system tools, libraries, and all necessary settings into a single unit. This ensures the container can be reliably transferred between different computing environments and be executed as expected.

### Building The Docker Image

The Docker images that the Agent will run inside the SVM must have some restrictions. The image must have a `/cocos` directory containing the `datasets` and `results` directories. The Agent will run this image inside the SVM and mount the `datasets` and `results` onto the `/cocos/datasets` and `/cocos/results` directories inside the image. The docker image must also contain the command that will be run when the docker container is run.

We will use the linear regression example from the cocos repository in this example.

```bash
git clone https://github.com/ultravioletrs/cocos.git
```

Then, use your favorite editor to create a file named `Dockerfile` in the current working directory and write the following code.

```bash
FROM python:3.9-slim

# set the working directory in the container
WORKDIR /cocos
RUN mkdir /cocos/results
RUN mkdir /cocos/datasets 

COPY ./cocos/test/manual/algo/requirements.txt /cocos/requirements.txt
COPY ./cocos/test/manual/algo/lin_reg.py /cocos/lin_reg.py

# install dependencies
RUN pip install -r requirements.txt

# command to be run when the docker container is started
CMD ["python3", "/cocos/lin_reg.py"]
```

Next, run the build command and save the docker image as a `tar` file.

```bash
docker build -t linreg .
docker save linreg > linreg.tar
```

### Running Docker in SVM

Change the current working directory to `cocos`.

```bash
cd ./cocos
```

Start the computation server:

```bash
go run ./test/computations/main.go ./test/manual/algo/lin_reg.py public.pem false ./test/manual/data/iris.csv
```

Start the manager

```bash
sudo \
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_GRPC_URL=localhost:7001 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
go run ./cmd/manager/main.go
```

Export the agent grpc url from computation server logs

```bash
export AGENT_GRPC_URL=localhost:6015
```

Upload the algorithm

```bash
./build/cocos-cli algo ../linreg.tar ./private.pem -a docker
```

Upload the dataset

```bash
./build/cocos-cli data ./test/manual/data/iris.csv ./private.pem
```

After some time when the results are ready, you can run the following command to get the results:

```bash
./build/cocos-cli results ./private.pem
```

To make inference on the results, you can use the following command:

```bash
python3 ./test/manual/algo/lin_reg.py predict result.zip ./test/manual/data
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

Start the computation server:

```bash
go run ./test/computations/main.go ./addition-inference.wasm public.pem true
```

Start the manager

```bash
sudo \
MANAGER_QEMU_SMP_MAXCPUS=4 \
MANAGER_GRPC_URL=localhost:7001 \
MANAGER_LOG_LEVEL=debug \
MANAGER_QEMU_ENABLE_SEV_SNP=false \
MANAGER_QEMU_OVMF_CODE_FILE=/usr/share/edk2/x64/OVMF_CODE.fd \
MANAGER_QEMU_OVMF_VARS_FILE=/usr/share/edk2/x64/OVMF_VARS.fd \
go run main.go
```

Export the agent grpc url from computation server logs

```bash
export AGENT_GRPC_URL=localhost:6013
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
unzip result.zip -d results
```

```bash
cat results/results/results.txt
```

The output will be similar to this:

```bash
"[5.141593, 4.0, 5.0, 8.141593]"
```

Terminal recording session

[![asciicast](https://asciinema.org/a/jLMzZzI13kVMXTGchDB8SKxs3.svg)](https://asciinema.org/a/jLMzZzI13kVMXTGchDB8SKxs3)

For real-world examples to test with cocos, see our [AI repository](https://github.com/ultravioletrs/ai).
