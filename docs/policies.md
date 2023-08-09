# Policies

## User Policies

### Add User Policies

_Only_ admin or a member with `g_add` policy in relation to the group can use `policies` endpoint.

```bash
curl -sSiX POST http://localhost:9003/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "<user_id>",
  "object": "<group_id>",
  "actions": ["<action_1>", ..., "<action_N>"]
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost:9003/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "55bdf567-3595-42c6-8aa6-4091fdcc88da",
  "object": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "actions": ["c_list", "g_list"]
}
EOF

HTTP/1.1 201 Created
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:46:53 GMT
Content-Length: 0
```

### Updating User Policies

```bash
curl -sSiX PUT http://localhost:9003/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "<user_id>",
  "object": "<group_id>",
  "actions": ["<action_1>", ..., "<action_N>"]
}
EOF
```

For example:

```bash
curl -sSiX PUT http://localhost:9003/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "55bdf567-3595-42c6-8aa6-4091fdcc88da",
  "object": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "actions": ["c_delete", "g_add"]
}
EOF

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:47:07 GMT
```

### Lisiting User Policies

```bash
curl -isSX GET http://localhost:9003/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET http://localhost:9003/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:47:20 GMT
Content-Length: 365

{
  "limit": 10,
  "offset": 0,
  "total": 1,
  "policies": [
    {
      "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
      "subject": "55bdf567-3595-42c6-8aa6-4091fdcc88da",
      "object": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
      "actions": ["c_delete", "g_add"],
      "created_at": "2023-08-02T08:46:53.834944Z",
      "updated_at": "2023-08-02T08:47:07.248309Z",
      "updated_by": "dbec6755-8af5-4ce5-a042-8966b90ad84a"
    }
  ]
}
```

### Delete User Policies

_Only_ admin or owner of the policy can delete a policy.

```bash
curl -isSX DELETE "http://localhost:9003/policies/<user_id>/<group_id>" -H "Accept: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX DELETE "http://localhost:9003/policies/55bdf567-3595-42c6-8aa6-4091fdcc88da/0c5bb86a-5545-4e5f-9169-d9a0bff92c95" -H "Accept: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:47:48 GMT
```

If you delete policies, the policy will be removed from the policy storage. Further authorization checks related to that policy will fail.

## Computations Policies

### Add Computation Policies

_Only_ admin or the owner of the computation can use `/policies` endpoint.

```bash
curl -sSiX POST http://localhost:9000/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "user": "<user_id>",
  "computation": "<computation_id>",
  "role": ["<role_1>", ..., "<role_N>"]
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost:9000/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "user": "55bdf567-3595-42c6-8aa6-4091fdcc88da",
  "computation": "75e85000-bfea-4faf-b6c6-51fc22e52f92",
  "role": ["view"]
}
EOF

HTTP/1.1 201 Created
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:51:42 GMT
Content-Length: 0
```

### Updating Computation Policies

The admin or the owner of the computation can update the policy.

```bash
curl -sSiX PUT http://localhost:9000/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "user": "<user_id>",
  "computation": "<computation_id>",
  "role": ["<role_1>", ..., "<role_N>"]
}
EOF
```

For example:

```bash
curl -sSiX PUT http://localhost:9000/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "user": "55bdf567-3595-42c6-8aa6-4091fdcc88da",
  "computation": "75e85000-bfea-4faf-b6c6-51fc22e52f92",
  "role": ["view", "run"]
}
EOF

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:52:40 GMT
Content-Length: 0
```

### Lisiting Computation Policies

As an admin, you can list all the policies, while as a user you can only list your own policies.

```bash
curl -isSX GET http://localhost:9000/policies -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET http://localhost:9000/policies -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:52:55 GMT
Content-Length: 345

{
  "limit": 10,
  "total": 1,
  "policies": [
    {
      "owner": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
      "user": "55bdf567-3595-42c6-8aa6-4091fdcc88da",
      "computation": "75e85000-bfea-4faf-b6c6-51fc22e52f92",
      "roles": ["view", "run"],
      "created_at": "2023-08-02T08:51:42.844285Z",
      "updated_at": "2023-08-02T08:52:40.327864Z",
      "updated_by": "dbec6755-8af5-4ce5-a042-8966b90ad84a"
    }
  ]
}
```

### Delete Computation Policies

The admin or the owner of the computation can delete the policy.

```bash
curl -isSX DELETE http://localhost:9000/policies/<user_id>/<computation_id> -H "Accept: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX DELETE http://localhost:9000/policies/50569d27-060d-42aa-87a8-11b596ef0e68/75e85000-bfea-4faf-b6c6-51fc22e52f92 -H "Accept: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Wed, 02 Aug 2023 09:02:11 GMT
```

If you delete policies, the policy will be removed from the policy storage. Further authorization checks related to that policy will fail.
