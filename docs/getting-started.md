# Getting Started

## Users

For user management, we use Mainflux Users micorservice. By default, this service will be running on the port `9003`.

### Create User

In order to create user, we need to provide username and password. The `USER_TOKEN` is optional and is used for ownership:

```bash
curl "http://localhost:9003/users" -H "Content-Type: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d '{
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
curl -sSi "http://localhost:9003/users" -H "Content-Type: application/json" --data-raw '{"name": "example user", "credentials": {"identity": "example@cocos.com","secret": "12345678"}}'
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /users/50569d27-060d-42aa-87a8-11b596ef0e68
Date: Mon, 17 Jul 2023 14:23:42 GMT
Content-Length: 225

{
  "id": "50569d27-060d-42aa-87a8-11b596ef0e68",
  "name": "example user",
  "credentials": { "identity": "example@cocos.com", "secret": "" },
  "created_at": "2023-07-17T14:23:42.061947Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

### Login User

In order to login user, we need to provide username and password:

```bash
curl -sSi "http://localhost:9003/users/tokens/issue" -H "Content-Type: application/json" -H "Content-Type: application/json" --data-raw '{"identity": "<user_identity>","secret": "<user_password>"}'
```

Example:

```bash
curl -sSi "http://localhost:9003/users/tokens/issue" -H "Content-Type: application/json" -H "Content-Type: application/json" --data-raw '{"identity": "example@cocos.com","secret": "12345678"}'
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Date: Mon, 17 Jul 2023 14:24:32 GMT
Content-Length: 707

{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODk2MDU2NzIsImlhdCI6MTY4OTYwMzg3MiwiaWRlbnRpdHkiOiJleGFtcGxlQGNvY29zLmNvbSIsImlzcyI6ImNsaWVudHMuYXV0aCIsInN1YiI6IjUwNTY5ZDI3LTA2MGQtNDJhYS04N2E4LTExYjU5NmVmMGU2OCIsInR5cGUiOiJhY2Nlc3MifQ.jrrrzCT-sL3Y_UBK-cnPAlKNdlyolDajuRPSAlAKEO3WBsJtK6E-dKqy1-kIXx_C0j_FyfWIDFnLZ-LPR8ROXw",
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODk2OTAyNzIsImlhdCI6MTY4OTYwMzg3MiwiaWRlbnRpdHkiOiJleGFtcGxlQGNvY29zLmNvbSIsImlzcyI6ImNsaWVudHMuYXV0aCIsInN1YiI6IjUwNTY5ZDI3LTA2MGQtNDJhYS04N2E4LTExYjU5NmVmMGU2OCIsInR5cGUiOiJyZWZyZXNoIn0.68vHJClMJvRYpc2jdwdllmcsCi-yG9c9c2CdJgm3H3TEXq4UnOY_LOqonQAJF3zvNEf4GSiCx0e0Op4Lv7JOfQ",
  "access_type": "Bearer"
}
```

### Setting Users ENV Vars

We set the `USERID` and `USER_TOKEN` environment variables for later use:

```bash
USERID=
USER_TOKEN=
```

For example:

```bash
USERID=50569d27-060d-42aa-87a8-11b596ef0e68
USER_TOKEN=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODk2MDU2NzIsImlhdCI6MTY4OTYwMzg3MiwiaWRlbnRpdHkiOiJleGFtcGxlQGNvY29zLmNvbSIsImlzcyI6ImNsaWVudHMuYXV0aCIsInN1YiI6IjUwNTY5ZDI3LTA2MGQtNDJhYS04N2E4LTExYjU5NmVmMGU2OCIsInR5cGUiOiJhY2Nlc3MifQ.jrrrzCT-sL3Y_UBK-cnPAlKNdlyolDajuRPSAlAKEO3WBsJtK6E-dKqy1-kIXx_C0j_FyfWIDFnLZ-LPR8ROXw
```

### Get All Users

In order to get all of the users:

```bash
curl -sSi -X GET "http://localhost:9003/users" -H "Content-Type: application/json" -H 'Authorization: Bearer <user_token>
```

Example:

```bash
curl -sSi -X GET "http://localhost:9003/users" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 17 Jul 2023 14:28:56 GMT
Content-Length: 579

{
  "limit": 10,
  "total": 2,
  "users": [
    {
      "id": "05ac40cb-7304-48e4-8a2e-5c7cc1c097f7",
      "name": "example user",
      "owner": "50569d27-060d-42aa-87a8-11b596ef0e68",
      "credentials": { "identity": "example1@cocos.com", "secret": "" },
      "created_at": "2023-07-17T14:28:41.743212Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    },
    {
      "id": "fcdfc671-1a2c-4721-bc7d-808ffb06cc56",
      "name": "example user",
      "owner": "50569d27-060d-42aa-87a8-11b596ef0e68",
      "credentials": { "identity": "example2@cocos.com", "secret": "" },
      "created_at": "2023-07-17T14:28:53.917506Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

### Get Specific User

Getting one particular user, by ID:

```bash
curl -sSi -X GET "http://localhost:9003/users/<user_id>" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X GET "http://localhost:9003/users/$USERID" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 17 Jul 2023 14:27:08 GMT
Content-Length: 285

{
  "id": "50569d27-060d-42aa-87a8-11b596ef0e68",
  "name": "example user",
  "credentials": {
    "identity": "example@cocos.com",
    "secret": "$2a$10$tqnnI3LHAl.gHsi5nebrM.iX0V4ZVNTpHFIneRdilK5/bk2UNNv8q"
  },
  "created_at": "2023-07-17T14:23:42.061947Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

For more information, please refer to [Users Docs](./users.md).

## Computations

For computation management, we use Computations micorservice. By default, this service will be running on the port `9000`.

### Create Computation

In order to create computation, we can to provide the following content:

```bash
curl -sSi -X POST http://localhost:9000/computations -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
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
curl -sSi -X POST http://localhost:9000/computations -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d @- << EOF
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
curl -sSi -X GET http://localhost:9000/computations -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X GET http://localhost:9000/computations -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
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

### Setting Computations ENV Vars

We set the `COMPUTATION_ID` environment variables for later use:

```bash
COMPUTATION_ID=
```

For example:

```bash
COMPUTATION_ID=894fac83-723e-4e19-8821-734455d68bd2
```

### Get One Computation

In order to get one pspecific computation, by ID:

```bash
curl -sSi -X GET "http://localhost:9000/computations/<computation_id>" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X GET "http://localhost:9000/computations/$COMPUTATION_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 17 Jul 2023 14:34:21 GMT
Content-Length: 341

{
  "id": "894fac83-723e-4e19-8821-734455d68bd2",
  "name": "computation",
  "description": "computations description",
  "status": "executable",
  "owner": "50569d27-060d-42aa-87a8-11b596ef0e68",
  "start_time": "2023-07-17T14:30:18.460839Z",
  "end_time": "0001-01-01T00:00:00Z",
  "datasets": ["dataset1", "dataset2"],
  "algorithms": ["algorithm1", "algorithm2"],
  "ttl": 3600
}
```

### Delete Computation

In order to delete computation:

```bash
curl -sSi -X DELETE "http://localhost:9000/computations/<computation_id>" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X DELETE "http://localhost:9000/computations/$COMPUTATION_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 17 Jul 2023 14:35:01 GMT
```

For more information, please refer to [Computations Docs](./computations.md).

## Datasets

For dataset management, we use Datasets micorservice. By default, this service will be running on the port `9001`.

### Create Dataset

In order to create dataset, we can to provide the following content:

```bash
curl -sSi -X POST http://localhost:9001/datasets -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
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

For example:

```bash
curl -sSi -X POST http://localhost:9001/datasets -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d @- <<EOF
{
  "name": "dataset",
  "description": "dataset description",
  "location": "http://localhost:9001/datasets/74584111-24fb-4fe2-9722-a3f8f61ad991",
  "format": "csv",
  "metadata": {}
}
EOF
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /datasets/2ed996a6-4e7d-47e1-b16e-4be92b68f544
Date: Mon, 17 Jul 2023 14:39:43 GMT
Content-Length: 0
```

### Get All Datasets

In order to get all datasets:

```bash
curl -sSi -X GET http://localhost:9001/datasets -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSi -X GET http://localhost:9001/datasets -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 17 Jul 2023 14:40:49 GMT
Content-Length: 346

{
  "total": 1,
  "offset": 0,
  "limit": 10,
  "order": "",
  "direction": "",
  "datasets": [
    {
      "id": "2ed996a6-4e7d-47e1-b16e-4be92b68f544",
      "name": "dataset",
      "description": "dataset description",
      "created_at": "2023-07-17T14:39:43.25271Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "location": "http://localhost:9001/datasets/74584111-24fb-4fe2-9722-a3f8f61ad991",
      "format": "csv"
    }
  ]
}
```

### Setting Datatset ENV Vars

We set the `DATASET_ID` environment variables for later use:

```bash
DATASET_ID=
```

For example:

```bash
DATASET_ID=2ed996a6-4e7d-47e1-b16e-4be92b68f544
```

### Get One Dataset

In order to get one pspecific computation, by ID:

```bash
curl -sSi -X GET http://localhost:9001/datasets/<dataset_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSi -X GET http://localhost:9001/datasets/$DATASET_ID -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 17 Jul 2023 14:43:56 GMT
Content-Length: 273

{
  "id": "2ed996a6-4e7d-47e1-b16e-4be92b68f544",
  "name": "dataset",
  "description": "dataset description",
  "created_at": "2023-07-17T14:39:43.25271Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "location": "http://localhost:9001/datasets/74584111-24fb-4fe2-9722-a3f8f61ad991",
  "format": "csv"
}
```

### Delete Dataset

In order to delete dataset:

```bash
curl -sSi -X DELETE http://localhost:9001/datasets/<dataset_id> -H "Content-Type: application/json" -H  "Authorization: Bearer <token>"
```

For example:

```bash
curl -sSi -X DELETE http://localhost:9001/datasets/$DATASET_ID -H "Content-Type: application/json" -H  "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 17 Jul 2023 14:45:16 GMT
```

For more information, please refer to [Datasets Docs](./datasets.md).
