# Computations

## Add Computation

Add a new Computation.

```bash
curl -sSi -X POST http://localhost:9000/computations -H "Content-Type: application/json" -d @- <<EOF
{
  "name": "Computation01",
  "description": "Brief Description",
  "datasets": [
    "first dataset"
  ],
  "algorithms": [
    "first algorithm"
  ],
  "startTime": 0,
  "endTime": 0,
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

Response:-

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /computations/3e2045b6-af36-4706-8d40-8da16b5dbc21
Date: Fri, 26 May 2023 12:17:40 GMT
Content-Length: 0

```

## Retrieve Computations

Retrieves all Computations.

```bash
curl -sSi -X GET http://localhost:9000/computations/ -H "Content-Type: application/json"
```

## Retrieve Computation Information

Retrieve a single Computation.

```bash
curl -X GET 'http://localhost:9000/computations/$COMP_ID' -H 'Content-Type: application/json'
```

## Update Computations Information

Update the fields of a Computation.

```bash

```

## Remove a Computation

Remove/Delete a particular Computation.

```bash

```
