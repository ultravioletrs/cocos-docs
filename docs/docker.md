# Docker

For this example, you will use the `lin_reg.py` algorithm that is part of the `cocos` repository. Throughout the creation of the docker image, we assume that our current working directory is the directory in which the `cocos` repository is cloned. For example:
```bash
ls
cocos  Dockerfile
```
The docker image that the Agent will run inside the SVM must have directories where the Agent will mount the datasets and results directories. The docker image author can provide this directory to the Agent using the CLI options `datasets` and `results`. For example:
```bash
go run ./cocos/cmd/cli/main.go algo ./linreg.tar <private_key_file_path> -a docker -c "python3 /cocos/lin_reg.py" --results "/cocos/results" --datasets "/cocos/datasets" ./linreg.tar
```

## Logistic Regression example

Here we will create a docker image with the `lin_reg.py` algorithm.

The first step is to create a Docker file. Use your favorite editor to create a Dockerfile and pass the following content into it.

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
```

Next, run the build command and then save the docker image as a `tar` file.
```bash
docker build -t linreg .
docker save linreg > linreg.tar
```

When the SVM starts, you can use these parameters for the CLI `algo` command:

 * `-a docker`
 * `-c "python3 /cocos/lin_reg.py"`
 * `--datasets "/cocos/datasets"`
 * `--results "/cocos/results"`
