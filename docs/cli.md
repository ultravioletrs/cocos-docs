# Agent CLI

This repository contains the command-line interface (CLI) tool for interacting with the Agent service. The CLI allows you to perform various tasks related to the computation and management of algorithms and datasets.

## Build

To build the CLI, follow these steps:

1. Clone the repository: `go get github.com/ultravioletrs/agent`
2. Please replace `$GOPATH` with the actual path to your Go workspace.
3. Navigate to the project root: `cd $GOPATH/src/github.com/ultravioletrs/agent`
4. Build the CLI binary: `make cli`

## Usage

The Agent CLI provides several commands for different actions:

#### Run Computation

To run a computation, use the following command:

```bash
./build/cocos-cli run --computation '{"name": "my-computation"}'
```

#### Upload Algorithm

To upload an algorithm, use the following command:

```bash
./build/cocos-cli algo /path/to/algorithm
```

#### Upload Dataset

To upload a dataset, use the following command:

```bash
./build/cocos-cli data /path/to/dataset.csv
```

#### Retrieve Result

To retrieve the computation result, use the following command:

```bash
./build/cocos-cli result
```

### Installation

You have the option to install the CLI globally on your system. Here's how:

Build the CLI: Run `make install-cli`.

The CLI binary will be installed to `~/.local/bin/cocos-cli`.

### Notes

The CLI supports various configuration flags and options.

Use the `--help` flag with any command to see additionalinformation.

The CLI uses gRPC for communication with the Agent service.

Make sure to have the necessary dependencies installed before building or running the CLI.