# Getting Started

## Users

For user management, we use Mainflux Users micorservice. By default, this service will be running on the port `9003`.

### Create User

In order to create user, we need to provide identity and secret. The `USER_TOKEN` is optional and is used for ownership:

```bash
curl -sSiX POST http://localhost:9003/users -H "Content-Type: application/json" -H "Authorization: Bearer [user_token]" -d @- <<EOF
{
  "name": "[name]",
  "credentials": {
    "identity": "<identity>",
    "secret": "<secret>"
  },
  "tags": [
    "[tag_1]", ..., "[tag_N]"
  ],
  "owner": "[owner_id]",
  "metadata": {},
  "status": "[status]"
}
EOF
```

Example:

```bash
curl -sSiX POST http://localhost:9003/users -H "Content-Type: application/json" -d @- <<EOF
{
  "name": "John Doe",
  "credentials": {
    "identity": "john.doe@example.com",
    "secret": "12345678"
  }
}
EOF
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /users/55543d34-77fc-48e7-b6c4-6acfca6e5c86
Date: Tue, 01 Aug 2023 11:12:13 GMT
Content-Length: 228

{
  "id": "55543d34-77fc-48e7-b6c4-6acfca6e5c86",
  "name": "John Doe",
  "credentials": { "identity": "john.doe@example.com", "secret": "" },
  "created_at": "2023-08-01T11:12:13.694759Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

### Login User

In order to login user, we need to provide username and password:

```bash
curl -sSiX POST http://localhost:9003/users/tokens/issue -H "Content-Type: application/json" -d @- <<EOF
{
  "identity": "<identity>",
  "secret": "<secret>"
}
EOF
```

Example:

```bash
curl -sSiX POST http://localhost:9003/users/tokens/issue -H "Content-Type: application/json" -d @- <<EOF
{
  "identity": "john.doe@example.com",
  "secret": "12345678"
}
EOF
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Date: Tue, 01 Aug 2023 11:12:52 GMT
Content-Length: 709

{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTA4OTAxNzIsImlhdCI6MTY5MDg4ODM3MiwiaWRlbnRpdHkiOiJleGFtcGxlMUBjb2Nvcy5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiI1NTU0M2QzNC03N2ZjLTQ4ZTctYjZjNC02YWNmY2E2ZTVjODYiLCJ0eXBlIjoiYWNjZXNzIn0.hOH6b4FU73Odz8MK5_OqkmbY4twgUobMp68oYPwm_JPb5-91Wkclqmf6-bkxoW8TlU3TYI5ay_ORjNhhCkUxBQ",
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTA5NzQ3NzIsImlhdCI6MTY5MDg4ODM3MiwiaWRlbnRpdHkiOiJleGFtcGxlMUBjb2Nvcy5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiI1NTU0M2QzNC03N2ZjLTQ4ZTctYjZjNC02YWNmY2E2ZTVjODYiLCJ0eXBlIjoicmVmcmVzaCJ9.Cmc1kLdrjEgY1jPXYxYSOWc47Tdm2-XCp1R9rhcvKJrg9xc5OdsSWdvLEYCx_SLF3qGPuZox5D6shOvmHsqIgA",
  "access_type": "Bearer"
}
```

### Get All Users

In order to get all of the users:

```bash
curl -sSiX GET http://localhost:9003/users -H "Authorization: Bearer <admin_token>"
```

Example:

```bash
curl -sSiX GET http://localhost:9003/users -H "Authorization: Bearer <admin_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 01 Aug 2023 11:14:41 GMT
Content-Length: 261

{
  "limit": 10,
  "total": 1,
  "users": [
    {
      "id": "55543d34-77fc-48e7-b6c4-6acfca6e5c86",
      "name": "John Doe",
      "credentials": { "identity": "john.doe@example.com", "secret": "" },
      "created_at": "2023-08-01T11:12:13.694759Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

### Get Specific User

Getting one particular user, by ID:

```bash
curl -sSiX GET http://localhost:9003/users/<user_id> -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX GET http://localhost:9003/users/55543d34-77fc-48e7-b6c4-6acfca6e5c86 -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 01 Aug 2023 11:16:10 GMT
Content-Length: 288

{
  "id": "55543d34-77fc-48e7-b6c4-6acfca6e5c86",
  "name": "John Doe",
  "credentials": {
    "identity": "john.doe@example.com",
    "secret": "$2a$10$5.0wXH15jr9Lp9LBrQSDEOmyuvLstXMv68LHjw2OSFSdfzHh6Lg/i"
  },
  "created_at": "2023-08-01T11:12:13.694759Z",
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
curl -sSiX POST http://localhost:9000/computations -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "[name]",
  "description": "[description]",
  "datasets": [
    "<dataset_1>", ..., "[dataset_n]"
  ],
  "algorithms": [
    "<algorithm_1>", ..., "[algorithm_n]"
  ],
  "datasetProviders": [
    "<dataset_provider_1>", ..., "[dataset_provider_n]"
  ],
  "algorithmProviders": [
    "<algorithm_provider_1>", ..., "[algorithm_provider_n]"
  ],
  "ttl": [ttl],
  "metadata": {}
}
EOF
```

Example:

```bash
curl -sSiX POST http://localhost:9000/computations -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "Machine Diagnostics Analysis",
  "description": "Performing diagnostics analysis on machine data",
  "datasets": [
    "Sensor Data Logs", "Machine Health Records", "Maintenance Reports"
  ],
  "algorithms": [
    "Support Vector Machines"
  ],
  "dataset_providers": [
    "SensorTech Solutions", "Machinery Data Systems"
  ],
  "algorithm_providers": [
    "AlgoAI Research Labs", "TechBots Innovations", "IntelliCompute Technologies"
  ],
  "result_consumers": [
    "Machine Maintenance Department", "Predictive Analytics Team", "Industrial Automation Division"
  ],
  "ttl": 48,
  "metadata": {
    "machine_type": "Automated Assembly Line",
    "industry": "Manufacturing",
    "data_frequency": "Hourly",
    "analysis_purpose": "Optimize machine performance and prevent downtime"
  }
}
EOF
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /computations/1ca3b356-98dd-48ee-beb0-5c6c90cc1c58
Date: Tue, 01 Aug 2023 11:18:46 GMT
Content-Length: 0
```

### Get All Computations

In order to get all computations:

```bash
curl -sSiX GET http://localhost:9000/computations -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX GET http://localhost:9000/computations -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 01 Aug 2023 11:20:05 GMT
Content-Length: 926

{
  "total": 1,
  "limit": 10,
  "computations": [
    {
      "id": "1ca3b356-98dd-48ee-beb0-5c6c90cc1c58",
      "name": "Machine Diagnostics Analysis",
      "description": "Performing diagnostics analysis on machine data",
      "status": "executable",
      "owner": "55543d34-77fc-48e7-b6c4-6acfca6e5c86",
      "start_time": "2023-08-01T11:18:46.858077Z",
      "end_time": "0001-01-01T00:00:00Z",
      "datasets": [
        "Sensor Data Logs",
        "Machine Health Records",
        "Maintenance Reports"
      ],
      "algorithms": ["Support Vector Machines"],
      "dataset_providers": ["SensorTech Solutions", "Machinery Data Systems"],
      "algorithm_providers": [
        "AlgoAI Research Labs",
        "TechBots Innovations",
        "IntelliCompute Technologies"
      ],
      "result_consumers": [
        "Machine Maintenance Department",
        "Predictive Analytics Team",
        "Industrial Automation Division"
      ],
      "ttl": 48,
      "metadata": {
        "analysis_purpose": "Optimize machine performance and prevent downtime",
        "data_frequency": "Hourly",
        "industry": "Manufacturing",
        "machine_type": "Automated Assembly Line"
      }
    }
  ]
}
```

### Get One Computation

In order to get one specific computation, by ID:

```bash
curl -sSiX GET http://localhost:9000/computations/<computation_id> -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX GET http://localhost:9000/computations/1ca3b356-98dd-48ee-beb0-5c6c90cc1c58 -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 01 Aug 2023 11:21:22 GMT
Content-Length: 886

{
  "id": "1ca3b356-98dd-48ee-beb0-5c6c90cc1c58",
  "name": "Machine Diagnostics Analysis",
  "description": "Performing diagnostics analysis on machine data",
  "status": "executable",
  "owner": "55543d34-77fc-48e7-b6c4-6acfca6e5c86",
  "start_time": "2023-08-01T11:18:46.858077Z",
  "end_time": "0001-01-01T00:00:00Z",
  "datasets": [
    "Sensor Data Logs",
    "Machine Health Records",
    "Maintenance Reports"
  ],
  "algorithms": ["Support Vector Machines"],
  "dataset_providers": ["SensorTech Solutions", "Machinery Data Systems"],
  "algorithm_providers": [
    "AlgoAI Research Labs",
    "TechBots Innovations",
    "IntelliCompute Technologies"
  ],
  "result_consumers": [
    "Machine Maintenance Department",
    "Predictive Analytics Team",
    "Industrial Automation Division"
  ],
  "ttl": 48,
  "metadata": {
    "analysis_purpose": "Optimize machine performance and prevent downtime",
    "data_frequency": "Hourly",
    "industry": "Manufacturing",
    "machine_type": "Automated Assembly Line"
  }
}
```

### Delete Computation

In order to delete computation:

```bash
curl -sSiX DELETE http://localhost:9000/computations/<computation_id> -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX DELETE http://localhost:9000/computations/1ca3b356-98dd-48ee-beb0-5c6c90cc1c58 -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Tue, 01 Aug 2023 11:22:29 GMT
```

For more information, please refer to [Computations Docs](./computations.md).
