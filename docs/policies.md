# Policies

## Authorize

```bash
curl -X POST 'http://localhost:9191/authorize' -H 'Content-Type: application/json' -H  "Authorization: Bearer <access_token>" -d "{'subject':<client_id>, 'object':<group_id>, 'actions':['g_list']}"
```

Respone:

```bash

```

## Add Policy

Add a new Policy.

```bash
curl -X POST 'http://localhost:9191/authorize' -H 'Content-Type: application/json' -H  "Authorization: Bearer <access_token>" -d '{"owner":"<client_id>", "subect":"sub", "object":"obj"}'
```

## Update Policy

Update an existing Policy.

## Delete Policy

Delete an existing Policy.

## List Policies

List all existing Policies.
