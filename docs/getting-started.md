# Getting Started

## Users

For user management, we use Mainflux Clients micorservice. By default, this service will be running on the port `9191`.

### Create User

In order to create user, we need to provide username and password. The `USERTOKEN` is optional and is used for ownership:

```bash
curl 'http://localhost:9002/users' -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Authorization: Bearer $USERTOKEN" -d '{
  "credentials": {
    "identity": "<string>",
    "secret": "<string>"
  },
  "name": "<string>",
  "tags": [
    "<string>",
    "<string>"
  ],
  "owner": "<uuid>",
  "metadata": {},
  "status": "<string>"
}'
```

Example:

```bash
curl 'http://localhost:9002/users' -H 'Content-Type: application/json' -H 'Accept: application/json' --data-raw '{"credentials": {"identity": "example@cocos.com","secret": "12345678"}}'
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /users/35ebd3bd-3fea-4c39-a618-8c61df3efa63
Date: Tue, 30 May 2023 10:30:53 GMT
Content-Length: 204

{
  "id": "35ebd3bd-3fea-4c39-a618-8c61df3efa63",
  "credentials": { "identity": "example@cocos.com", "secret": "" },
  "created_at": "2023-05-30T10:30:53.244909Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

### Login User

In order to login user, we need to provide username and password:

```bash
curl -sSi 'http://localhost:9002/users/tokens/issue' -H 'Content-Type: application/json' -H 'Accept: application/json' --data-raw '{"identity": "<user_identity>","secret": "<user_password>"}'
```

Example:

```bash
curl -sSi 'http://localhost:9002/users/tokens/issue' -H 'Content-Type: application/json' -H 'Accept: application/json' --data-raw '{"identity": "example@cocos.com","secret": "12345678"}'
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Date: Tue, 30 May 2023 10:33:13 GMT
Content-Length: 707

{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODU0NDM2OTMsImlhdCI6MTY4NTQ0Mjc5MywiaWRlbnRpdHkiOiJleGFtcGxlQGNvY29zLmNvbSIsImlzcyI6ImNsaWVudHMuYXV0aCIsInN1YiI6IjI2OTEzNzI3LTU2ZGYtNDQyNi1hZTY2LTU1NzhkMDBiNDgyMCIsInR5cGUiOiJhY2Nlc3MifQ.wOFRB8GKZPfBBtxnaM3hlGQgN85h_Xe_hjap6Ma8GPEmmc6a5z-ocJ5ZxYiMvmEvCgCcBlTQWuYAjuXICB1kFg",
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODU1MjkxOTMsImlhdCI6MTY4NTQ0Mjc5MywiaWRlbnRpdHkiOiJleGFtcGxlQGNvY29zLmNvbSIsImlzcyI6ImNsaWVudHMuYXV0aCIsInN1YiI6IjI2OTEzNzI3LTU2ZGYtNDQyNi1hZTY2LTU1NzhkMDBiNDgyMCIsInR5cGUiOiJyZWZyZXNoIn0.rgZU7tQ-kpmbA8p0zJgPVFHmSaa2gPnX4GEILIchzvVDZP4970VUw4NfCzC0juWMhoR0CtO_Pxt-Ude_hTP4vA",
  "access_type": "Bearer"
}
```

### Get Specific User

Getting one particular user, by ID:

```bash
curl -sSi -X GET 'http://localhost:9002/users/<user_id>' -H 'Accept: application/json' -H 'Authorization: Bearer <user_token>'
```

Example:

```bash
curl -sSi -X GET 'http://localhost:9002/users/26913727-56df-4426-ae66-5578d00b4820' -H 'Accept: application/json' -H "Authorization: Bearer $USERTOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 30 May 2023 10:40:41 GMT
Content-Length: 263

{
  "id": "26913727-56df-4426-ae66-5578d00b4820",
  "credentials": {
    "identity": "example@cocos.com",
    "secret": "$2a$10$q05IQRyb0dwJrTiIv4qw6upo9LSJBtlX08Ts5enIDloXlf8SwkhNy"
  },
  "created_at": "2023-05-30T10:29:06.267262Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

### Get All Users

In order to get all of the users:

```bash
curl -sSi -X GET http://localhost:9191/clients -H "Content-Type: application/json" -H 'Authorization: Bearer <user_token>
```

Example:

```bash
curl -sSi -X GET 'http://localhost:9002/users' -H 'Accept: application/json' -H "Authorization: Bearer $USERTOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 30 May 2023 10:43:11 GMT
Content-Length: 644

{
  "limit": 10,
  "total": 3,
  "users": [
    {
      "id": "26913727-56df-4426-ae66-5578d00b4820",
      "credentials": { "identity": "example@cocos.com", "secret": "" },
      "created_at": "2023-05-30T10:29:06.267262Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    },
    {
      "id": "07af7a7b-bd1a-4d8b-af7f-4f1bf589ad51",
      "credentials": { "identity": "example2@cocos.com", "secret": "" },
      "created_at": "2023-05-30T10:30:24.720498Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    },
    {
      "id": "35ebd3bd-3fea-4c39-a618-8c61df3efa63",
      "credentials": { "identity": "example3@cocos.com", "secret": "" },
      "created_at": "2023-05-30T10:30:53.244909Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

For more information, please refer to [Users API](https://github.com/mainflux/docs/pull/138).

## Computations

For computation management, we use Computations micorservice. By default, this service will be running on the port `9000`.

### Create Computation

In order to create computation, we can to provide the following content:

```bash
curl -sSi -X POST http://localhost:9000/computations -H "Content-Type: application/json" -H 'Authorization: Bearer <user_token>' -d @- << EOF
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

Example:

```bash
curl -sSi -X POST http://localhost:9000/computations -H "Content-Type: application/json" -H "Authorization: Bearer $USERTOKEN" -d @- << EOF
{
  "name": "computation",
  "description": "computations description",
  "datasets": [
    "dataset1",
    "dataset2"
  ],
  "algorithms": [
    "algorithm1",
    "algorithm2"
  ],
  "status": "status",
  "datasetProviders": [
    "datasetProvider1",
    "datasetProvider2"
  ],
  "algorithmProviders": [
    "algorithmProvider1",
    "algorithmProvider2"
  ],
  "ttl": 3600,
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

### Get All Computations

In order to get all computations:

```bash
curl -sSi -X GET http://localhost:9000/computations -H "Content-Type: application/json" -H 'Authorization: Bearer <user_token>'
```

Example:

```bash
curl -sSi -X GET http://localhost:9000/computations -H "Content-Type: application/json" -H "Authorization: Bearer $USERTOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 14:42:21 GMT
Content-Length: 283

{
    "total": 1,
    "limit": 10,
    "computations": [
        {
            "id": "0cc5a6aa-0fba-479c-a8e9-98fe6338ff6a",
            "name": "string",
            "description": "string",
            "status": "string",
            "owner": "string",
            "start_time": "2022-10-24T14:41:52.650971Z",
            "end_time": "0001-01-01T00:00:00Z",
            "datasets": [
                "string"
            ],
            "algorithms": [
                "string"
            ]
        }
    ]
}
```

### Get One Computation

In order to get one pspecific computation, by ID:

```bash
curl -sSi -X GET http://localhost:9000/computations/<computation_id> -H "Content-Type: application/json" -H 'Authorization: Bearer <user_token>'
```

Example:

```bash
curl -sSi -X GET http://localhost:9000/computations/$computation_id -H "Content-Type: application/json" -H "Authorization: Bearer $USERTOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 24 Oct 2022 14:43:07 GMT
Content-Length: 243

{
  "id": "31b0dd3f-9f05-4000-9330-c6da0c33bf2a",
  "name": "computation",
  "description": "computations description",
  "status": "status",
  "owner": "db5e92c6-e003-4945-a096-4b9c2471fe3d",
  "start_time": "2023-06-09T14:54:37.16522Z",
  "end_time": "2023-06-09T15:54:37.16522Z",
  "datasets": ["dataset1", "dataset2"],
  "algorithms": ["algorithm1", "algorithm2"],
  "ttl": 3600
}

```

### Update computation

In order to update computation:

```bash
curl -sSi -X PUT http://localhost:9000/computations/<computation_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "<computation_name>",
  "description": "<computation_description>",
  "metadata": {}
}
EOF
```

Example:

```bash
curl -sSi -X PUT http://localhost:9000/computations/$computation_id -H "Content-Type: application/json" -H "Authorization: Bearer $USERTOKEN" -d @- <<EOF
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

### Delete Computation

In order to delete computation:

```bash
curl -sSi -X DELETE http://localhost:9000/computations/<computation_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X DELETE http://localhost:9000/computations/$computation_id -H "Content-Type: application/json" -H "Authorization: Bearer $USERTOKEN"
```

Response:

```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 24 Oct 2022 14:49:13 GMT
```

### Run Computation

In order to get one pspecific computation, by ID:

```bash
curl -sSi -X POST http://localhost:9000/computations/<computation_id>/run -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

## Datasets

For dataset management, we use Datasets micorservice. By default, this service will be running on the port `9001`.

### Create Dataset

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

### Get All Datasets

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

{
    "total": 1,
    "offset": 0,
    "limit": 10,
    "order": "",
    "direction": "",
    "datasets": [
        {
            "id": "74584111-24fb-4fe2-9722-a3f8f61ad991",
            "name": "string",
            "description": "string",
            "owner": "string",
            "created_at": "2022-10-24T15:10:45.554617Z",
            "updated_at": "0001-01-01T00:00:00Z",
            "location": "string",
            "format": "string"
        }
    ]
}
```

### Get One Dataset

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

{
    "id": "74584111-24fb-4fe2-9722-a3f8f61ad991",
    "name": "string",
    "description": "string",
    "owner": "string",
    "created_at": "2022-10-24T15:10:45.554617Z",
    "updated_at": "0001-01-01T00:00:00Z",
    "location": "string",
    "format": "string"
}
```

### Update dataset

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

### Delete Dataset

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
