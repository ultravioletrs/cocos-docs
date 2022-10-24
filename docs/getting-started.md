## Getting Started

### Users

For user management, we use Mainflux Clients micorservice. By default, this service will be running on the port `9191`.

#### Create User
In order to create user, we need to provide username and password:

```bash
curl -sSi -X POST http://localhost:9191/clients -H "Content-Type: application/json" -d @- <<EOF
{
    "credentials" : {
        "identity":"<client_email>",
        "secret":"<client_password>"
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

#### Memberships
In order to list user's membership:

```bash
curl -sSi -X GET http://localhost:9191/clients/01GG5328XV48SRSH7H8KPVDNS2/memberships -H "Content-Type: application/json" -H  "Authorization: Bearer <token>"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 13:34:13 GMT
Content-Length: 49

{"total":0,"level":0,"name":"","memberships":[]}
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

### Groups

For groups management, we use Mainflux Clients micorservice. By default, this service will be running on the port `9191`.

#### Create Group
In order to create group, we need to provide name:

```bash
curl -sSi -X POST http://localhost:9191/groups -H "Content-Type: application/json" -d @- <<EOF
{
  "name": "<group_name>",
  "description": "<group_description>",
  "owner_id":"<owner_id>",
  "parent_id":"<previous_group_id>",
  "metadata": {}
}               
EOF             
```

Response:
```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /groups/01GG4RA4GH7MS8WY5DZ6Q372BM
Date: Mon, 24 Oct 2022 10:23:46 GMT
Content-Length: 0
```

#### Get Group
Getting one particular group, by ID:

```bash
curl -sSi -X GET http://localhost:9191/groups/<group_id> -H "Content-Type: application/json"
```
Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 10:26:43 GMT
Content-Length: 258

{"id":"01GG4RA4GH7MS8WY5DZ6Q372BM","owner_id":"","parent_id":"","name":"string","description":"string","metadata":{},"level":1,"path":"01GG4RA4GH7MS8WY5DZ6Q372BM","children":null,"created_at":"2022-10-24T10:23:46.70592Z","updated_at":"0001-01-01T00:00:00Z"}
```

#### Update Group
In order to update group entity:

```bash
curl -sSi -X PUT http://localhost:9191/groups/<group_id> -H "Content-Type: application/json" -H  "Authorization: Bearer <token>" -d @- <<EOF
{
  "name": "<group_name>",
  "description": "<group_description>",
  "metadata": {<group_metadata>}
}               
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 11:46:06 GMT
Content-Length: 0
```

#### Delete Group
In order to delete group entity:

```bash
curl -sSi -X DELETE http://localhost:9191/groups/<group_id> -H "Content-Type: application/json"
```

Response:
```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 24 Oct 2022 12:00:22 GMT
```

#### Members
In order to list group members:

```bash
curl -sSi -X GET http://localhost:9191/groups/<group_id>/members -H  "Authorization: Bearer <token>" -H "Content-Type: application/json"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 12:06:13 GMT
Content-Length: 56

{"limit":10,"total":0,"level":0,"name":"","members":[]}
```

#### Get groups
In order to list groups:

```bash
curl -sSi -X GET http://localhost:9191/groups
```

Response:
```bash
{"total":3,"level":0,"name":"","groups":[{"id":"01GG4Z7SQMJKX6QE9108XCAB3B","owner_id":"","parent_id":"","name":"group1","description":"string","metadata":{},"level":1,"path":"01GG4Z7SQMJKX6QE9108XCAB3B","children":null,"created_at":"2022-10-24T12:24:50.164476Z","updated_at":"0001-01-01T00:00:00Z"},{"id":"01GG4Z80RCZ5PNJ7YPEX14RGBF","owner_id":"","parent_id":"","name":"group2","description":"string","metadata":{},"level":1,"path":"01GG4Z80RCZ5PNJ7YPEX14RGBF","children":null,"created_at":"2022-10-24T12:24:57.356463Z","updated_at":"0001-01-01T00:00:00Z"},{"id":"01GG4Z88J4BDY1VSDQHTY9HHH5","owner_id":"","parent_id":"","name":"group3","description":"string","metadata":{},"level":1,"path":"01GG4Z88J4BDY1VSDQHTY9HHH5","children":null,"created_at":"2022-10-24T12:25:05.348221Z","updated_at":"0001-01-01T00:00:00Z"}]}
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

Response:
```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /computations/0cc5a6aa-0fba-479c-a8e9-98fe6338ff6a
Date: Mon, 24 Oct 2022 14:41:52 GMT
Content-Length: 0
```

#### Get All Computations
In order to get all computations:

```bash
curl -sSi -X GET http://localhost:9000/computations -H "Content-Type: application/json"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 14:42:21 GMT
Content-Length: 283

{"total":1,"limit":10,"computations":[{"id":"0cc5a6aa-0fba-479c-a8e9-98fe6338ff6a","name":"string","description":"string","status":"string","owner":"string","start_time":"2022-10-24T14:41:52.650971Z","end_time":"0001-01-01T00:00:00Z","datasets":["string"],"algorithms":["string"]}]}
```

#### Get One Computation
In order to get one pspecific computation, by ID:

```bash
curl -sSi -X GET http://localhost:9000/computations/<computation_id> -H "Content-Type: application/json"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 14:43:07 GMT
Content-Length: 243

{"id":"0cc5a6aa-0fba-479c-a8e9-98fe6338ff6a","name":"string","description":"string","status":"string","owner":"string","start_time":"2022-10-24T14:41:52.650971Z","end_time":"0001-01-01T00:00:00Z","datasets":["string"],"algorithms":["string"]}
```

#### Update computation
In order to update computation:

```bash
curl -sSi -X PUT http://localhost:9000/computations/<computation_id> -H "Content-Type: application/json" -H  "Authorization: Bearer <token>" -d @- <<EOF
{ 
  "name": "<computation_name>",
  "description": "<computation_description>",
  "metadata": {}                             
}     
EOF
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 14:46:51 GMT
Content-Length: 0
```

#### Delete Computation
In order to delete computation:

```bash
curl -sSi -X DELETE http://localhost:9000/computations/<computation_id> -H "Content-Type: application/json" -H  "Authorization: Bearer <token>"
```

Response:
```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 24 Oct 2022 14:49:13 GMT
```

#### Run Computation
In order to get one pspecific computation, by ID:

```bash
curl -sSi -X POST http://localhost:9000/computations/<computation_id>/run -H "Content-Type: application/json"
```

### Datasets

For dataset management, we use Datasets micorservice. By default, this service will be running on the port `9001`.

#### Create Dataset
In order to create dataset, we can to provide the following content:

```bash
curl -sSi -X POST http://localhost:9001/datasets -H "Content-Type: application/json" -d @- <<EOF
{
  "name": "string",
  "description": "string",
  "owner": "string",
  "createdAt": 0,
  "updatedAt": 0,
  "location": "string",
  "format": "string",
  "metadata": {}       
}               
EOF             
```

Response:
```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /datasets/74584111-24fb-4fe2-9722-a3f8f61ad991
Date: Mon, 24 Oct 2022 15:10:45 GMT
Content-Length: 0
```

#### Get All Datasets
In order to get all datasets:

```bash
curl -sSi -X GET http://localhost:9001/datasets -H "Content-Type: application/json"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 15:14:21 GMT
Content-Length: 292

{"total":1,"offset":0,"limit":10,"order":"","direction":"","datasets":[{"id":"74584111-24fb-4fe2-9722-a3f8f61ad991","name":"string","description":"string","owner":"string","created_at":"2022-10-24T15:10:45.554617Z","updated_at":"0001-01-01T00:00:00Z","location":"string","format":"string"}]}
```

#### Get One Dataset
In order to get one pspecific computation, by ID:

```bash
curl -sSi -X GET http://localhost:9001/datasets/<dataset_id> -H "Content-Type: application/json"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 15:15:53 GMT
Content-Length: 219

{"id":"74584111-24fb-4fe2-9722-a3f8f61ad991","name":"string","description":"string","owner":"string","created_at":"2022-10-24T15:10:45.554617Z","updated_at":"0001-01-01T00:00:00Z","location":"string","format":"string"}
```

#### Update dataset
In order to update dataset:

```bash
curl -sSi -X PUT http://localhost:9001/datasets/<dataset_id> -H "Content-Type: application/json" -H  "Authorization: Bearer <token>" -d @- <<EOF
{ 
  "name": "<dataset_name>",
  "description": "<dataset_description>",
  "metadata": {}                             
}                                                                                   
EOF
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 15:18:26 GMT
Content-Length: 0

```

#### Delete Dataset
In order to delete dataset:

```bash
curl -sSi -X DELETE http://localhost:9001/datasets/<dataset_id> -H "Content-Type: application/json" -H  "Authorization: Bearer <token>"
```

Response:
```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 24 Oct 2022 15:21:03 GMT
```