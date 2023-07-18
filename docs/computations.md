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
curl -sSi -X POST http://localhost:9000/computations -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d @- << EOF
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
Location: /computations/97f22205-4f2d-4bf5-894c-1c7f649d158e
Date: Tue, 18 Jul 2023 12:50:48 GMT
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
Date: Tue, 18 Jul 2023 12:50:53 GMT
Content-Length: 926

{
  "total": 1,
  "limit": 10,
  "computations": [
    {
      "id": "97f22205-4f2d-4bf5-894c-1c7f649d158e",
      "name": "Machine Diagnostics Analysis",
      "description": "Performing diagnostics analysis on machine data",
      "status": "executable",
      "owner": "59bb1958-3452-418a-a7b8-6412712e082d",
      "start_time": "2023-07-18T12:50:48.380058Z",
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

## Retrieve Computation Information

In order to get one pspecific computation, by ID:

```bash
curl -sSi -X GET "http://localhost:9000/computations/<computation_id>" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSi -X GET "http://localhost:9000/computations/97f22205-4f2d-4bf5-894c-1c7f649d158e" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 18 Jul 2023 12:51:43 GMT
Content-Length: 886

{
  "id": "97f22205-4f2d-4bf5-894c-1c7f649d158e",
  "name": "Machine Diagnostics Analysis",
  "description": "Performing diagnostics analysis on machine data",
  "status": "executable",
  "owner": "59bb1958-3452-418a-a7b8-6412712e082d",
  "start_time": "2023-07-18T12:50:48.380058Z",
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
curl -sSi -X PUT "http://localhost:9000/computations/97f22205-4f2d-4bf5-894c-1c7f649d158e" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d @- <<EOF
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
curl -sSi -X DELETE "http://localhost:9000/computations/97f22205-4f2d-4bf5-894c-1c7f649d158e" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
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
curl -sSi -X POST "http://localhost:9000/computations/97f22205-4f2d-4bf5-894c-1c7f649d158e/run" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"
```

Response:

```bash
```
