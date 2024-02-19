# Install

Before proceeding, install the following prerequisites:

- [go](https://go.dev/doc/install) (version 1.22.0)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.9.0)

Once everything is installed, execute the following command from project root:

To run CoCoS.ai, first download the cocos git repository:

```bash
git clone git@github.com:ultravioletrs/cocos.git
cd cocos
make -j5
```

Finally - you can run the backend (within `cocos` directory):

```bash
make run
```
