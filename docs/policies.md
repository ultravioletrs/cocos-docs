# Policies

## User Policies

### Add User Policies

You can add policies as well through an HTTP endpoint. _Only_ admin or member with `g_add` policy to the object can use this endpoint. Therefore, you need an authentication token.

_user_token_ must belong to the user.

> Must-have: user_token, group_id, user_id and policy_actions

```bash
curl -isSX POST "http://localhost:9003/policies" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d '{"subject": "<user_id>", "object": "<group_id>", "actions": ["<action_1>", ..., "<action_N>"]}'
```

For example:

```bash
curl -isSX POST "http://localhost:9003/policies" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d '{"subject": "3187a78e-e06d-4109-8f52-f0f1ea661c33", "object": "f0ac0d64-e7af-464c-b717-a00b24118c0e", "actions": ["c_list", "g_list"]}'

HTTP/1.1 201 Created
Content-Type: application/json
Date: Mon, 17 Jul 2023 15:20:13 GMT
Content-Length: 0
```

### Updating User Policies

> Must-have: user_token, group_id, user_id and policy_actions

```bash
curl -isSX PUT "http://localhost:9003/policies" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d '{"subject": "<user_id>", "object": "<group_id>", "actions": ["<action_1>", ..., "<action_N>"]}'
```

For example:

```bash
curl -isSX PUT "http://localhost:9003/policies" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d '{"subject": "3187a78e-e06d-4109-8f52-f0f1ea661c33", "object": "f0ac0d64-e7af-464c-b717-a00b24118c0e", "actions": ["c_delete"]}'

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 17 Jul 2023 15:20:44 GMT
```

### Lisiting User Policies

> Must-have: user_token

```bash
curl -isSX GET "http://localhost:9003/policies" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET "http://localhost:9003/policies" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 17 Jul 2023 15:20:58 GMT
Content-Length: 305

{
  "limit": 10,
  "offset": 0,
  "total": 1,
  "policies": [
    {
      "owner_id": "50569d27-060d-42aa-87a8-11b596ef0e68",
      "subject": "3187a78e-e06d-4109-8f52-f0f1ea661c33",
      "object": "f0ac0d64-e7af-464c-b717-a00b24118c0e",
      "actions": ["c_delete"],
      "created_at": "2023-07-17T15:20:13.466463Z",
      "updated_at": "2023-07-17T15:20:44.004903Z"
    }
  ]
}
```

### Delete User Policies

The admin can delete policies. _Only_ admin or owner of the policy can delete a policy.

> Must-have: user_token, object, subjects_ids and policies

```bash
curl -isSX DELETE -H "Accept: application/json" -H "Authorization: Bearer <user_token>" "http://localhost:9003/policies/<user_id>/<group_id>"
```

For example:

```bash
curl -isSX DELETE -H 'Accept: application/json' -H "Authorization: Bearer $USER_TOKEN" "http://localhost:9003/policies/3187a78e-e06d-4109-8f52-f0f1ea661c33/f0ac0d64-e7af-464c-b717-a00b24118c0e"

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 17 Jul 2023 15:21:44 GMT
```

If you delete policies, the policy will be removed from the policy storage. Further authorization checks related to that policy will fail.

## Computations Policies

### Add Computation Policies

You can add policies as well through an HTTP endpoint. _Only_ admin or the owner of the computation can use this endpoint. Therefore, you need an authentication token.

_user_token_ must belong to the user.

> Must-have: user_token, computation_id, user_id and roles

```bash
curl -isSX POST "http://localhost:9000/policies" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d '{"user": "<user_id>", "computation": "<computation_id>", "role": ["<role_1>", ..., "<role_N>"]}'
```

For example:

```bash
curl -isSX POST "http://localhost:9000/policies" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d '{"user": "50569d27-060d-42aa-87a8-11b596ef0e68", "computation": "fbb39123-9e82-44b2-a7d1-eb20c0c73c60", "role": ["view", "edit"]}'

HTTP/1.1 201 Created
Content-Type: application/json
Date: Mon, 17 Jul 2023 15:24:48 GMT
Content-Length: 0
```

### Updating Computation Policies

> Must-have: user_token, computation_id, user_id and role

```bash
curl -isSX PUT "http://localhost:9000/policies" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d '{"user": "<user_id>", "computation": "<computation_id>", "role": ["<role_1>", ..., "<role_N>"]}'
```

For example:

```bash
curl -isSX PUT "http://localhost:9000/policies" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d '{"user": "50569d27-060d-42aa-87a8-11b596ef0e68", "computation": "fbb39123-9e82-44b2-a7d1-eb20c0c73c60", "role": ["run"]}'

HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 17 Jul 2023 15:25:15 GMT
Content-Length: 0
```

### Lisiting Computation Policies

> Must-have: user_token

```bash
curl -isSX GET "http://localhost:9000/policies" -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET "http://localhost:9000/policies" -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 17 Jul 2023 15:25:29 GMT
Content-Length: 338

{
  "limit": 10,
  "total": 1,
  "policies": [
    {
      "owner": "50569d27-060d-42aa-87a8-11b596ef0e68",
      "user": "50569d27-060d-42aa-87a8-11b596ef0e68",
      "computation": "fbb39123-9e82-44b2-a7d1-eb20c0c73c60",
      "roles": ["run"],
      "created_at": "2023-07-17T15:24:48.915877Z",
      "updated_at": "2023-07-17T15:25:15.113692Z",
      "updated_by": "50569d27-060d-42aa-87a8-11b596ef0e68"
    }
  ]
}
```

### Delete Computation Policies

The admin can delete policies.

> Must-have: user_token, computation_id and user_id.

```bash
curl -isSX DELETE -H "Accept: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9000/policies/:user/:computation"
```

For example:

```bash
curl -isSX DELETE -H 'Accept: application/json' -H "Authorization: Bearer $USER_TOKEN" "http://localhost:9000/policies/50569d27-060d-42aa-87a8-11b596ef0e68/fbb39123-9e82-44b2-a7d1-eb20c0c73c60"

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Mon, 17 Jul 2023 15:26:18 GMT
```

If you delete policies, the policy will be removed from the policy storage. Further authorization checks related to that policy will fail.
