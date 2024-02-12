# Computations

The computations service provides a means to manage computations, with functions such as computation creation, update, deletion, and running.

## Add Computation

In order to create computation, we can to provide the following content:

```bash
curl -sSiX POST http://localhost/computations -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "<name>",
  "description": "<description>",
  "datasets": [
    "<dataset_1>", ..., "[dataset_N]"
  ],
  "algorithms": [
    "<algorithm_1>", ..., "[algorithm_N]"
  ],
  ],
  "owner": "<owner>",
  "datasetProviders": [
    "<dataset_provider_1>", ..., "[dataset_provider_N]"
  ],
  "algorithmProviders": [
    "<algorithm_provider_1>", ..., "[algorithm_provider_N]"
  ],
  "ttl": <ttl>,
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
Date: Thu, 10 Aug 2023 07:29:22 GMT
Location: /computations/8b131663-058d-4e8f-8ccb-cc83c3f9e694
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

## Retrieve Computations

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
Content-Length: 926
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:29:35 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "total": 1,
  "limit": 10,
  "computations": [
    {
      "id": "8b131663-058d-4e8f-8ccb-cc83c3f9e694",
      "name": "Machine Diagnostics Analysis",
      "description": "Performing diagnostics analysis on machine data",
      "status": "executable",
      "owner": "1b849a99-cef7-42f5-a7f4-e00b1f439e08",
      "start_time": "2023-08-10T07:29:22.313962Z",
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

In order to get one specific computation, by ID:

```bash
curl -sSiX GET http://localhost/computations/<computation_id> -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX GET http://localhost/computations/8b131663-058d-4e8f-8ccb-cc83c3f9e694 -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Length: 886
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:29:59 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "8b131663-058d-4e8f-8ccb-cc83c3f9e694",
  "name": "Machine Diagnostics Analysis",
  "description": "Performing diagnostics analysis on machine data",
  "status": "executable",
  "owner": "1b849a99-cef7-42f5-a7f4-e00b1f439e08",
  "start_time": "2023-08-10T07:29:22.313962Z",
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
curl -sSiX PUT http://localhost/computations/<computation_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "[computation_name]",
  "description": "[computation_description]",
  "datasets": ["[dataset_1]", "[dataset_2]", "[dataset_3]"],
  "algorithms": ["[algorithm_1]", "[algorithm_2]", "[algorithm_3]"],
  "dataset_providers": ["[dataset_provider_1]", "[dataset_provider_2]"],
  "algorithm_providers": ["[algorithm_provider_1]", "[algorithm_provider_2]"],
  "result_consumers": ["[result_consumer_1]", "[result_consumer_2]"],
  "metadata": {}
}
EOF
```

Example:

```bash
curl -sSiX PUT http://localhost/computations/8b131663-058d-4e8f-8ccb-cc83c3f9e694 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "CNC Machine Diagnostics Analysis",
  "description": "Performing diagnostics analysis on CNC machine data",
  "datasets": [
    "Sensor Data Logs",
    "Machine Health Records",
    "Maintenance Reports",
    "XYZ 1000 Machine Data"
  ],
  "algorithms": [
    "Support Vector Machines",
    "Random Forest",
    "Neural Networks"
  ],
  "dataset_providers": [
    "SensorTech Solutions",
    "Machinery Data Systems",
    "ABC Manufacturing"
  ],
  "algorithm_providers": [
    "AlgoAI Research Labs",
    "TechBots Innovations",
    "IntelliCompute Technologies",
    "ABC Manufacturing"
  ],
  "result_consumers": [
    "Machine Maintenance Department",
    "Predictive Analytics Team",
    "Industrial Automation Division",
    "ABC Manufacturing"
  ],
  "metadata": {
    "analysis_purpose": "Optimize machine performance and prevent downtime",
    "data_frequency": "Hourly",
    "industry": "Manufacturing",
    "machine_type": "Job Shop",
    "machine_type": "CNC Milling Machine",
    "machine_model": "XYZ 1000",
    "machine_serial_number": "1234567890"
  }
}
EOF
```

Response:

```bash
HTTP/1.1 200 OK
Content-Length: 0
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:30:24 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

## Run Computation

In order to get one pspecific computation, by ID:

```bash
curl -sSiX POST http://localhost/computations/<computation_id>/run -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX POST http://localhost/computations/8b131663-058d-4e8f-8ccb-cc83c3f9e694/run -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Length: 1192
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:34:01 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "Computation": "{\"id\":\"8b131663-058d-4e8f-8ccb-cc83c3f9e694\",\"name\":\"CNC Machine Diagnostics Analysis\",\"description\":\"Performing diagnostics analysis on CNC machine data\",\"status\":\"executable\",\"owner\":\"1b849a99-cef7-42f5-a7f4-e00b1f439e08\",\"start_time\":\"2023-08-10T07:29:22.313962Z\",\"end_time\":\"0001-01-01T00:00:00Z\",\"datasets\":[\"Sensor Data Logs\",\"Machine Health Records\",\"Maintenance Reports\",\"XYZ 1000 Machine Data\"],\"algorithms\":[\"Support Vector Machines\",\"Random Forest\",\"Neural Networks\"],\"dataset_providers\":[\"SensorTech Solutions\",\"Machinery Data Systems\",\"ABC Manufacturing\"],\"algorithm_providers\":[\"AlgoAI Research Labs\",\"TechBots Innovations\",\"IntelliCompute Technologies\",\"ABC Manufacturing\"],\"result_consumers\":[\"Machine Maintenance Department\",\"Predictive Analytics Team\",\"Industrial Automation Division\",\"ABC Manufacturing\"],\"ttl\":48,\"metadata\":{\"analysis_purpose\":\"Optimize machine performance and prevent downtime\",\"data_frequency\":\"Hourly\",\"industry\":\"Manufacturing\",\"machine_model\":\"XYZ 1000\",\"machine_serial_number\":\"1234567890\",\"machine_type\":\"CNC Milling Machine\"}}"
}
```

## Remove a Computation

In order to delete computation:

```bash
curl -sSiX DELETE "http://localhost/computations/<computation_id>" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX DELETE "http://localhost/computations/8b131663-058d-4e8f-8ccb-cc83c3f9e694" -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:34:17 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```
