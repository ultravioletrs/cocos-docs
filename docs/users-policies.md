# Policies

## User Policies

### Add User Policies

_Only_ admin or a member with `g_add` policy in relation to the group can use `policies` endpoint.

```bash
curl -sSiX POST http://localhost/users/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "<user_id>",
  "object": "<group_id>",
  "actions": ["<action_1>", ..., "<action_N>"]
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost/users/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
  "object": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "actions": ["g_list", "c_list"]
}
EOF

HTTP/1.1 201 Created
Content-Length: 0
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:17:51 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

### Updating User Policies

```bash
curl -sSiX PUT http://localhost/users/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "<user_id>",
  "object": "<group_id>",
  "actions": ["<action_1>", ..., "<action_N>"]
}
EOF
```

For example:

```bash
curl -sSiX PUT http://localhost/users/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
  "object": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "actions": ["c_delete", "g_add"]
}
EOF

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:18:24 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

### Lisiting User Policies

```bash
curl -isSX GET http://localhost/users/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET http://localhost/users/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 365
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:18:38 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 10,
  "offset": 0,
  "total": 1,
  "policies": [
    {
      "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
      "subject": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
      "object": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
      "actions": ["c_delete", "g_add"],
      "created_at": "2023-08-10T08:17:51.462127Z",
      "updated_at": "2023-08-10T08:18:24.882169Z",
      "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283"
    }
  ]
}
```

### Delete User Policies

_Only_ admin or owner of the policy can delete a policy.

```bash
curl -isSX DELETE "http://localhost/users/policies/<user_id>/<group_id>" -H "Accept: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX DELETE "http://localhost/users/policies/47887629-7b4c-4bf5-b414-35bb2a5f5f23/b19c8738-0efa-400e-aaf0-610ef42f1ee1" -H "Accept: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:19:03 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

If you delete policies, the policy will be removed from the policy storage. Further authorization checks related to that policy will fail.

## Computations Policies

### Add Computation Policies

_Only_ admin or the owner of the computation can use `/policies` endpoint.

```bash
curl -sSiX POST http://localhost/computations/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "user": "<user_id>",
  "computation": "<computation_id>",
  "role": ["<role_1>", ..., "<role_N>"]
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost/computations/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "user": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
  "computation": "306d5348-4865-42df-91e3-b292cc94387f",
  "role": ["view"]
}
EOF

HTTP/1.1 201 Created
Content-Length: 0
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:20:34 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

### Updating Computation Policies

The admin or the owner of the computation can update the policy.

```bash
curl -sSiX PUT http://localhost/computations/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "user": "<user_id>",
  "computation": "<computation_id>",
  "role": ["<role_1>", ..., "<role_N>"]
}
EOF
```

For example:

```bash
curl -sSiX PUT http://localhost/computations/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "user": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
  "computation": "306d5348-4865-42df-91e3-b292cc94387f",
  "role": ["view", "run"]
}
EOF

HTTP/1.1 200 OK
Content-Length: 0
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:20:48 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

### Lisiting Computation Policies

As an admin, you can list all the policies, while as a user you can only list your own policies.

```bash
curl -isSX GET http://localhost/computations/policies -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET http://localhost/computations/policies -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 344
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:20:59 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 10,
  "total": 1,
  "policies": [
    {
      "owner": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
      "user": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
      "computation": "306d5348-4865-42df-91e3-b292cc94387f",
      "roles": ["view", "run"],
      "created_at": "2023-08-10T08:20:34.867615Z",
      "updated_at": "2023-08-10T08:20:48.09559Z",
      "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283"
    }
  ]
}
```

### Delete Computation Policies

The admin or the owner of the computation can delete the policy.

```bash
curl -isSX DELETE http://localhost/computations/policies/<user_id>/<computation_id> -H "Accept: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX DELETE http://localhost/computations/policies/50569d27-060d-42aa-87a8-11b596ef0e68/306d5348-4865-42df-91e3-b292cc94387f -H "Accept: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:21:13 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

If you delete policies, the policy will be removed from the policy storage. Further authorization checks related to that policy will fail.
