## Install

## Backend
Before proceeding, install the following prerequisites:

- [Docker](https://docs.docker.com/install/) (version 20.10.17)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.9.0)

Once everything is installed, execute the following command from project root:

To run the backend, first download Mainflux Clients service and create Docker image:

```bash
git clone git@github.com:ultravioletrs/clients.git
cd clients
make -j 16 && make -j 16 docker_dev
```

Then to the similar for Cocos AI backend:

```bash
git clone git@github.com:ultravioletrs/cocos.git
cd cocos
make -j 16 && make -j 16 dockers_dev
```

Finaly - you can run the backned (within `cocos` directory):

```bash
make run
```

### Frontend
To deploy the user interface run the following commands:

```bash
git clone git@github.com:ultravioletrs/cocos-ui.git
cd cocos-ui/cmd/ui
go run main.go
```

The User Interface can now be accesible from [http://localhost:9090](http://localhost:9090/).

> [http://localhost:9090/](http://localhost/9090) is for internal use only, and is not intended to be used by the end-user.
> Only port `80` is exposed to the outside world via NginX proxy.