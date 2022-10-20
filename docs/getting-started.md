## Getting Started

### Users

For user management, we use Mainflux Clients micorservice. By default, this service will be running on the port `9191`.

#### Create User
In order to create user, we need to provide username and password:

```bash
curl -sSi -X POST http://localhost:9191/clients -H "Content-Type: application/json" -d @- <<EOF
{
    "credentials" : {
        "identity":"john.doe@email.com",
        "secret":"12345678"
    }
}
EOF
```

#### Get All Users
In order to get all of the users:

```bash
curl -sSi -X GET http://localhost:9191/clients -H "Content-Type: application/json"
```

#### Get Specific User
Getting one particular user, by ID:

```bash
curl -sSi -X GET http://localhost:9191/clients/<client_id> -H "Content-Type: application/json"
```

#### Login User
In order to create user, we need to provide username and password:

```bash
curl -sSi -X POST http://localhost:9191/tokens -H "Content-Type: application/json" -d @- <<EOF
{
  "credentials" : {
    "identity":"john.doe@email.com",
    "secret":"12345678"
  }
}
EOF
```

### Computations

For computation management, we use Computations micorservice. By default, this service will be running on the port `9000`.

#### Create Computation
In order to create computation, we can to provide the following content:

```bash
curl -sSi -X POST http://localhost:9000/computations -H "Content-Type: application/json" -d @- <<EOF
{
  "name": "string",
  "description": "string",
  "datasets": [
    "string"
  ],
  "algorithms": [
    "string"
  ],
  "startTime": 0,
  "endTime": 0,
  "status": "string",
  "owner": "string",
  "datasetProviders": [
    "string"
  ],
  "algorithmProviders": [
    "string"
  ],
  "ttl": 0,
  "metadata": {}
}
EOF
```

#### Get All Computations
In order to create computation, we can to provide the following content:

```bash
curl -sSi -X GET http://localhost:9000/computations -H "Content-Type: application/json"
```

#### Get One Computation
In order to get one pspecific computation, by ID:

```bash
curl -sSi -X GET http://localhost:9000/computations/<computation_id> -H "Content-Type: application/json"
```

#### Run Computation
In order to get one pspecific computation, by ID:

```bash
curl -sSi -X POST http://localhost:9000/computations/<computation_id>/run -H "Content-Type: application/json"
```
