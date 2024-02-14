# Install

## Backend

Before proceeding, install the following prerequisites:

- [Docker](https://docs.docker.com/install/) (version 20.10.17)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.9.0)

Once everything is installed, execute the following command from project root:

To run the backend, first download Cocos AI backend:

```bash
git clone git@github.com:ultravioletrs/cocos.git
cd cocos
make && make dockers_dev
```

Finaly - you can run the backned (within `cocos` directory):

```bash
make run
```
