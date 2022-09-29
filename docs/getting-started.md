## Getting Started

### Step 1 - Run the System
Before proceeding, install the following prerequisites:

- [Docker](https://docs.docker.com/install/) (version 20.10.17)
- [Docker compose](https://docs.docker.com/compose/install/) (version 2.9.0)

Once everything is installed, execute the following command from project root:

To run the backend:

```bash
git clone git@github.com:ultravioletrs/cocos.git
make dockers
docker compose -f docker/docker-compose.yml up
```

### Step 2 - Access the User Interface
To deploy the user interface run the following commands:

```bash
git clone git@github.com:ultravioletrs/cocos-ui.git
cd cocos-ui/cmd/ui
go run main.go
```

The User Interface can now be accesible from `[http://localhost/9090](http://localhost/9090)`.

> `[http://localhost:9090/](http://localhost/9090)` is for internal use only, and is not intended to be used by the end-user.
> Only port `80` is exposed to the outside world via NginX proxy.
