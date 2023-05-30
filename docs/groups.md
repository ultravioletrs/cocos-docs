# Groups

## Create Group
In order to create a group, we need to provide Group name(required), description, parentId and metadata (all optional):
```bash
curl -X POST 'http://localhost:9191/groups' -H 'Content-Type: application/json' -H "Authorization: Bearer <access_token>" -d '{"name": "group01"}'
```

Response:
```bash
{"id":"d9b1d9fa-d260-4633-96fe-21d0d7ef5af0","owner_id":"5c648185-5753-4ee9-bab6-93278d7b06b4","name":"group01","level":0,"path":"","created_at":"2023-05-23T14:23:47.414943Z","updated_at":"2023-05-23T14:23:47.414943Z","status":"enabled"}
```

## List Groups
To List all the Groups.

```bash
curl -X GET 'http://localhost:9191/groups' -H 'Content-Type: application/json' -H "Authorization: Bearer <access_token>"
```

Response:
```bash
{"total":1,"level":0,"name":"","groups":[{"id":"d9b1d9fa-d260-4633-96fe-21d0d7ef5af0","owner_id":"5c648185-5753-4ee9-bab6-93278d7b06b4","name":"group01","level":0,"path":"","created_at":"2023-05-23T14:23:47.414943Z","updated_at":"2023-05-23T14:23:47.414943Z","status":"enabled"}]}
```

## View Group
To view a specific Group.

```bash
curl -X GET "http://localhost:9191/groups/<group_id>" -H 'Content-Type: application/json' -H "Authorization: Bearer <access_token>"
```

Response:
```bash
{"id":"d9b1d9fa-d260-4633-96fe-21d0d7ef5af0","owner_id":"5c648185-5753-4ee9-bab6-93278d7b06b4","name":"group01","level":0,"path":"","created_at":"2023-05-23T14:23:47.414943Z","updated_at":"2023-05-23T14:23:47.414943Z","status":"enabled"}
```

## Update Group
Update a Group's Data

```bash
curl -X PUT "http://localhost:9191/groups/<group_id>" -H 'Content-Type: application/json' -H "Authorization: Bearer <access_token>" -d '{"name": "New Group Name","metadata": {},"description": "New Description Added"}'
```

Response:
```bash
{"id":"d9b1d9fa-d260-4633-96fe-21d0d7ef5af0","owner_id":"5c648185-5753-4ee9-bab6-93278d7b06b4","name":"New Group Name","description":"New Description Added","level":0,"path":"","created_at":"2023-05-23T14:23:47.414943Z","updated_at":"2023-05-24T12:01:26.857983Z","status":"enabled"}
```

## Enable Group
Enable a Disabled Group
```bash
curl -X POST "http://localhost:9191/groups/<group_id>/enable" -H 'Content-Type: application/json' -H "Authorization: Bearer <access_token>"
```

Response:
```bash
{"id":"d9b1d9fa-d260-4633-96fe-21d0d7ef5af0","owner_id":"5c648185-5753-4ee9-bab6-93278d7b06b4","name":"New Group Name","description":"New Description Added","level":0,"path":"","created_at":"2023-05-23T14:23:47.414943Z","updated_at":"2023-05-24T12:01:26.857983Z","status":"enabled"}
```

## Disable Group
Disable an Enabled Group
```bash
curl -X POST "http://localhost:9191/groups/<group_id>/disable" -H 'Content-Type: application/json' -H "Authorization: Bearer <access_token>"
```

Response:
```bash
{"id":"d9b1d9fa-d260-4633-96fe-21d0d7ef5af0","owner_id":"5c648185-5753-4ee9-bab6-93278d7b06b4","name":"New Group Name","description":"New Description Added","level":0,"path":"","created_at":"2023-05-23T14:23:47.414943Z","updated_at":"2023-05-24T12:01:26.857983Z","status":"disabled"}
```

## List Memberships
List Group Members

```bash
curl -X GET "http://localhost:9191/groups/<group_id>/members" -H 'Content-Type: application/json' -H "Authorization: Bearer <access_token>"
```

Response:
```bash
{"limit":10,"total":0,"level":0,"name":"","members":[]}
```