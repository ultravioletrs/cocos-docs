# Groups
<br></br>

## <ins>Create Group</ins>
In order to create a group, we need to provide Group name(required), description, parentId and metadata (all optional):
```bash
curl -X POST 'http://localhost:9191/groups' -H 'Content-Type: application/json' -H  "Authorization: Bearer $ACCTOK" -d '{"name": "group01"}'
```

Response:
```bash
{"id":"d9b1d9fa-d260-4633-96fe-21d0d7ef5af0","owner_id":"5c648185-5753-4ee9-bab6-93278d7b06b4","name":"group01","level":0,"path":"","created_at":"2023-05-23T14:23:47.414943Z","updated_at":"2023-05-23T14:23:47.414943Z","status":"enabled"}
```

## <ins>List Groups</ins>
<br></br>

```bash
curl -X GET 'http://localhost:9191/groups' -H 'Content-Type: application/json' -H  "Authorization: Bearer $ACCTOK" 
```

Response:
```bash
{"total":1,"level":0,"name":"","groups":[{"id":"d9b1d9fa-d260-4633-96fe-21d0d7ef5af0","owner_id":"5c648185-5753-4ee9-bab6-93278d7b06b4","name":"group01","level":0,"path":"","created_at":"2023-05-23T14:23:47.414943Z","updated_at":"2023-05-23T14:23:47.414943Z","status":"enabled"}]}
```

## <ins>View Group</ins>
<br></br>

## <ins>Update Group</ins>
<br></br>

## <ins>Enable Group</ins>
<br></br>

## <ins>Disable Group</ins>
<br></br>

## <ins>List Memberships</ins>
<br></br>