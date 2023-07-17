# Computations

## Add Computation

In order to create computation, we can to provide the following content:

```bash
curl -sSi -X POST "http://localhost:9000/computations" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
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
curl -sSi -X POST "http://localhost:9000/computations" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d @- << EOF
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

## Retrieve Computations

In order to get all computations:

```bash
curl -sSi -X GET "http://localhost:9000/computations" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X GET "http://localhost:9000/computations" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
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

## Retrieve Computation Information

In order to get one pspecific computation, by ID:

```bash
curl -sSi -X GET "http://localhost:9000/computations/<computation_id>" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X GET "http://localhost:9000/computations/31b0dd3f-9f05-4000-9330-c6da0c33bf2a" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
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

## Update Computations Information

In order to update computation:

```bash
curl -sSi -X PUT "http://localhost:9000/computations/<computation_id>" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "<computation_name>",
  "description": "<computation_description>",
  "metadata": {}
}
EOF
```

Example:

```bash
curl -sSi -X PUT "http://localhost:9000/computations/31b0dd3f-9f05-4000-9330-c6da0c33bf2a" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d @- <<EOF
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
Date: Fri, 09 Jun 2023 15:07:22 GMT
Content-Length: 0
```

## Remove a Computation

In order to delete computation:

```bash
curl -sSi -X DELETE "http://localhost:9000/computations/<computation_id>" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X DELETE "http://localhost:9000/computations/31b0dd3f-9f05-4000-9330-c6da0c33bf2a" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 24 Oct 2022 14:49:13 GMT
```

## Run Computation

In order to get one pspecific computation, by ID:

```bash
curl -sSi -X POST "http://localhost:9000/computations/<computation_id>/run" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X POST "http://localhost:9000/computations/31b0dd3f-9f05-4000-9330-c6da0c33bf2a/run" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
```
