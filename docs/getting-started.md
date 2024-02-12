# Getting Started

## Users

For user management, we use Magistrarla Users micorservice. By default, this service will be running on the port `9003`.

### Create User

In order to create user, we need to provide identity and secret. The `USER_TOKEN` is optional and is used for ownership:

```bash
curl -sSiX POST http://localhost/users -H "Content-Type: application/json" [-H "Authorization: Bearer <user_token>"] -d @- <<EOF
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
curl -sSiX POST http://localhost/users -H "Content-Type: application/json" -d @- <<EOF
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
Content-Length: 211
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:24:57 GMT
Location: /users/1b849a99-cef7-42f5-a7f4-e00b1f439e08
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "1b849a99-cef7-42f5-a7f4-e00b1f439e08",
  "name": "John Doe",
  "credentials": { "identity": "john.doe@example.com" },
  "created_at": "2023-08-10T07:24:57.33876Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}

```

### Login User

In order to login user, we need to provide username and password:

```bash
curl -sSiX POST http://localhost/users/tokens/issue -H "Content-Type: application/json" -d @- <<EOF
{
  "identity": "<identity>",
  "secret": "<secret>"
}
EOF
```

Example:

```bash
curl -sSiX POST http://localhost/users/tokens/issue -H "Content-Type: application/json" -d @- <<EOF
{
  "identity": "john.doe@example.com",
  "secret": "12345678"
}
EOF
```

Response:

```bash
HTTP/1.1 201 Created
Content-Length: 715
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:25:06 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTE2NTQxMDYsImlhdCI6MTY5MTY1MjMwNiwiaWRlbnRpdHkiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlzcyI6ImNsaWVudHMuYXV0aCIsInN1YiI6IjFiODQ5YTk5LWNlZjctNDJmNS1hN2Y0LWUwMGIxZjQzOWUwOCIsInR5cGUiOiJhY2Nlc3MifQ.FRaSjJT7wZVPSW6w-O3jyQa9WekLUzp6WcdakrZuvFgTsPvo29tbCNsX71ktJkwKeQUK1CPwRQrWrEu8tAOKFg",
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTE3Mzg3MDYsImlhdCI6MTY5MTY1MjMwNiwiaWRlbnRpdHkiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlzcyI6ImNsaWVudHMuYXV0aCIsInN1YiI6IjFiODQ5YTk5LWNlZjctNDJmNS1hN2Y0LWUwMGIxZjQzOWUwOCIsInR5cGUiOiJyZWZyZXNoIn0.iGpKn5FrTknYeuxqIxMd8x40MnExgaUJ1iWJ9Vg5szoShM-M6hu-Q1bNMcZQJoS4wxswGc50JzOjd7JSIYnucg",
  "access_type": "Bearer"
}

```

### Create an organization

```bash
curl -sSiX POST http://localhost/organizations/ -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "<domain_name>",
  "metadata": {
    "key": "value"
  },
  "tags": ["tag1", "tag2"],
  "alias": "<alias>",
  "status": "<status>",
  "permission": "<permission>",
  "created_by": "<created_by_id>",
  "permissions": ["permission1", "permission2"]
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost/organizations/ -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "organization 1",
  "description": "organization providing data",
  "metadata": {
    "meeting": "every monday",
    "location": "room 101"
  }
  "tags": ["data", "algo"],
  "alias": "org1",
  "status": "active",
}
EOF

HTTP/1.1 200 Ok
Content-Length: 331
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:03:34 GMT
Location: /organizations/b19c8738-0efa-400e-aaf0-610ef42f1ee1
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "name": "organization 1",
  "description": "organization providing data",
  "metadata": { 
    "location": "room 101", 
    "meeting": "every monday" 
  },
  "tags": ["data", "algo"],
  "alias": "org1",
  "created_at": "2023-08-10T08:03:34.204862Z",
  "created_by": "1b849a99-cef7-42f5-a7f4-e00b1f439e08",
  "updated_at": "0001-01-01T00:00:00Z",  
  "status": "active",
}

```

### Organization Login

To log in to an organization:

```bash
curl -sSiX POST http://localhost/organizations/tokens/issue -H "Content-Type: application/json" -H "Authorization : Bearer <user_token>" -d @- << EOF
{
  "orgID": "<organization_id>"
}
EOF
```

Example:

```bash
curl -sSiX POST http://localhost/organizations/tokens/issue -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "orgID": "b19c8738-0efa-400e-aaf0-610ef42f1ee1"
}
EOF
```

Resopnse:

```bash
HTTP/1.1 201 Created
Content-Length: 715
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:25:06 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTE2NTQxMDYsImlhdCI6MTY5MTY1MjMwNiwiaWRlbnRpdHkiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlzcyI6ImNsaWVudHMuYXV0aCIsInN1YiI6IjFiODQ5YTk5LWNlZjctNDJmNS1hN2Y0LWUwMGIxZjQzOWUwOCIsInR5cGUiOiJhY2Nlc3MifQ.FRaSjJT7wZVPSW6w-O3jyQa9WekLUzp6WcdakrZuvFgTsPvo29tbCNsX71ktJkwKeQUK1CPwRQrWrEu8tAOKFg",
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTE3Mzg3MDYsImlhdCI6MTY5MTY1MjMwNiwiaWRlbnRpdHkiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlzcyI6ImNsaWVudHMuYXV0aCIsInN1YiI6IjFiODQ5YTk5LWNlZjctNDJmNS1hN2Y0LWUwMGIxZjQzOWUwOCIsInR5cGUiOiJyZWZyZXNoIn0.iGpKn5FrTknYeuxqIxMd8x40MnExgaUJ1iWJ9Vg5szoShM-M6hu-Q1bNMcZQJoS4wxswGc50JzOjd7JSIYnucg",
  "access_type": "Bearer"
}
```

### Get All Users

In order to get all of the users:

```bash
curl -sSiX GET http://localhost/users -H "Authorization: Bearer <admin_token>"
```

Example:

```bash
curl -sSiX GET http://localhost/users -H "Authorization: Bearer <admin_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Length: 478
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:25:36 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 10,
  "total": 2,
  "users": [
    {
      "id": "1b849a99-cef7-42f5-a7f4-e00b1f439e08",
      "name": "John Doe",
      "credentials": { "identity": "john.doe@example.com" },
      "created_at": "2023-08-10T07:24:57.33876Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}

```

### Get Specific User

Getting one particular user, by ID:

```bash
curl -sSiX GET http://localhost/users/<user_id> -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX GET http://localhost/users/1b849a99-cef7-42f5-a7f4-e00b1f439e08 -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Length: 211
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:26:44 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "1b849a99-cef7-42f5-a7f4-e00b1f439e08",
  "name": "John Doe",
  "credentials": { "identity": "john.doe@example.com" },
  "created_at": "2023-08-10T07:24:57.33876Z",
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
curl -sSiX POST http://localhost/computations -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
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
curl -sSiX POST http://localhost/computations -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
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
Content-Length: 0
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:27:14 GMT
Location: /computations/8c0ad21d-9f57-4b02-89f2-f1030413b260
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

### Get All Computations

In order to get all computations:

```bash
curl -sSiX GET http://localhost/computations -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX GET http://localhost/computations -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Length: 925
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:27:28 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "total": 1,
  "limit": 10,
  "computations": [
    {
      "id": "8c0ad21d-9f57-4b02-89f2-f1030413b260",
      "name": "Machine Diagnostics Analysis",
      "description": "Performing diagnostics analysis on machine data",
      "status": "executable",
      "owner": "1b849a99-cef7-42f5-a7f4-e00b1f439e08",
      "start_time": "2023-08-10T07:27:14.85809Z",
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
curl -sSiX GET http://localhost/computations/<computation_id> -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX GET http://localhost/computations/8c0ad21d-9f57-4b02-89f2-f1030413b260 -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Length: 885
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:27:57 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "8c0ad21d-9f57-4b02-89f2-f1030413b260",
  "name": "Machine Diagnostics Analysis",
  "description": "Performing diagnostics analysis on machine data",
  "status": "executable",
  "owner": "1b849a99-cef7-42f5-a7f4-e00b1f439e08",
  "start_time": "2023-08-10T07:27:14.85809Z",
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
curl -sSiX DELETE http://localhost/computations/<computation_id> -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX DELETE http://localhost/computations/8c0ad21d-9f57-4b02-89f2-f1030413b260 -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:28:14 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

For more information, please refer to [Computations Docs](./computations.md).
