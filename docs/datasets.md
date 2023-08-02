# Datasets

## Add Dataset

In order to create dataset, we can to provide the following content:

```bash
curl -sSiX POST http://localhost:9001/datasets -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "[name]",
  "description": "[description]",
  "location": "[location]",
  "format": "[format]",
  "metadata": {}
}
EOF
```

Example:

```bash
curl -sSiX POST http://localhost:9001/datasets -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "Machine Data Logs",
  "description": "Machine data logs for diagnostics analysis",
  "location": "s3://bucket-name/path/to/file",
  "format": "csv",
  "metadata": {
    "data_frequency": "Hourly",
    "industry": "Manufacturing",
    "machine_type": "Automated Assembly Line"
  }
}
EOF
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /datasets/da58390c-3645-47af-8cfe-0c81bf8a43bf
Date: Tue, 01 Aug 2023 12:01:56 GMT
Content-Length: 0
```

## Retrieve Dataset

In order to get all datasets:

```bash
curl -sSiX GET http://localhost:9001/datasets -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX GET http://localhost:9001/datasets -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 01 Aug 2023 12:03:35 GMT
Content-Length: 449

{
  "total": 1,
  "offset": 0,
  "limit": 10,
  "order": "",
  "direction": "",
  "datasets": [
    {
      "id": "da58390c-3645-47af-8cfe-0c81bf8a43bf",
      "name": "Machine Data Logs",
      "description": "Machine data logs for diagnostics analysis",
      "created_at": "2023-08-01T12:01:56.039527Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "location": "s3://bucket-name/path/to/file",
      "format": "csv",
      "metadata": {
        "data_frequency": "Hourly",
        "industry": "Manufacturing",
        "machine_type": "Automated Assembly Line"
      }
    }
  ]
}
```

## Retrieve Dataset Information

In order to get one specific dataset, by ID:

```bash
curl -sSiX GET http://localhost:9001/datasets/<dataset_id> -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX GET http://localhost:9001/datasets/da58390c-3645-47af-8cfe-0c81bf8a43bf -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 01 Aug 2023 12:05:10 GMT
Content-Length: 376

{
  "id": "da58390c-3645-47af-8cfe-0c81bf8a43bf",
  "name": "Machine Data Logs",
  "description": "Machine data logs for diagnostics analysis",
  "created_at": "2023-08-01T12:01:56.039527Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "location": "s3://bucket-name/path/to/file",
  "format": "csv",
  "metadata": {
    "data_frequency": "Hourly",
    "industry": "Manufacturing",
    "machine_type": "Automated Assembly Line"
  }
}
```

## Update Dataset Information

In order to update dataset information, by ID:

```bash
curl -sSiX PUT http://localhost:9001/datasets/<dataset_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "[dataset_name]",
  "description": "[dataset_description]",
  "location": "[dataset_location]",
  "format": "[dataset_format]",
  "metadata": {}
}
EOF
```

Example:

```bash
curl -sSiX PUT http://localhost:9001/datasets/da58390c-3645-47af-8cfe-0c81bf8a43bf -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "CNC Machine Data Logs",
  "description": "CNC Machine data logs for diagnostics analysis",
  "location": "s3://new-bucket-name/path/to/file",
  "format": "tsv",
  "metadata": {
    "analysis_purpose": "Optimize machine performance and prevent downtime",
    "data_frequency": "Hourly",
    "industry": "Manufacturing",
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
Content-Type: application/json
Date: Tue, 01 Aug 2023 12:10:18 GMT
Content-Length: 0
```

## Delete a Dataset

In order to delete dataset:

```bash
curl -sSiX DELETE "http://localhost:9001/datasets/<dataset_id>" -H "Authorization: Bearer <user_token>"
```

Example:

```bash
curl -sSiX DELETE "http://localhost:9001/datasets/da58390c-3645-47af-8cfe-0c81bf8a43bf" -H "Authorization: Bearer <user_token>"
```

Response:

```bash
HTTP/1.1 204 No Content
Content-Type: application/json
Date: Tue, 01 Aug 2023 12:11:31 GMT
```
