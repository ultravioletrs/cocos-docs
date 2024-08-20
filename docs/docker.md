# Docker

For this example, you will use the `lin_reg.py` algorithm that is part of the `cocos` repository. Throughout the creation of the docker image, we assume that our current working directory is the directory in which the `cocos` repository is cloned. For example:
```bash
ls
cocos  Dockerfile
```
The docker image must have a `cocos` directory containing the `datasets` and `results` directories. The Agent will run this image inside the SVM and will mount the datasets and results onto the `/cocos/datasets` and `/cocos/results` directories inside the image. The docker image must also contain the command that will be run when the docker container is run.

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

When the SVM starts, you can use the flag `algorithm` with the value `docker` of the `algo` CLI option to send the docker image to the Agent.

```bash
go run ./cocos/cmd/cli/main.go algo --algorithm docker ./linreg.tar <private_key_file_path>
```
