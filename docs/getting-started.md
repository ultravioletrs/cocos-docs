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

Response:
```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /clients/01GFWW1VAB759Y1VMTG90YHH2S
Date: Fri, 21 Oct 2022 08:55:14 GMT
Content-Length: 0
```

#### Get All Users
In order to get all of the users:

```bash
curl -sSi -X GET http://localhost:9191/clients -H "Content-Type: application/json"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Fri, 21 Oct 2022 08:58:43 GMT
Content-Length: 687

{"limit":10,"total":3,"level":0,"name":"","clients":[{"id":"01GFWW1VAB759Y1VMTG90YHH2S","name":"","credentials":{"identity":"john.doe@email.com","secret":""},"metadata":{},"created_at":"2022-10-21T08:55:13.995922Z","updated_at":"0001-01-01T00:00:00Z","status":0},{"id":"01GFWW7DEWGSYNMZJKGR1PR1HN","name":"","credentials":{"identity":"john1.doe@email.com","secret":""},"metadata":{},"created_at":"2022-10-21T08:58:16.412029Z","updated_at":"0001-01-01T00:00:00Z","status":0},{"id":"01GFWW7N8W90WFP1G51ER56E7R","name":"","credentials":{"identity":"john2.doe@email.com","secret":""},"metadata":{},"created_at":"2022-10-21T08:58:24.412018Z","updated_at":"0001-01-01T00:00:00Z","status":0}]}
```

#### Get Specific User
Getting one particular user, by ID:

```bash
curl -sSi -X GET http://localhost:9191/clients/<client_id> -H "Content-Type: application/json"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Fri, 21 Oct 2022 08:57:24 GMT
Content-Length: 217

{"id":"01GFWW1VAB759Y1VMTG90YHH2S","name":"","credentials":{"identity":"john.doe@email.com","secret":""},"metadata":{},"created_at":"2022-10-21T08:55:13.995922Z","updated_at":"2022-10-21T08:55:13.995922Z","status":1}
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
