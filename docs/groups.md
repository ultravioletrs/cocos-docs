# Groups

## Create group

To create a group, you need the group name and a `user_token`

> Must-have: `user_token`, `name`
>
> Nice-to-have: `parent_id`, `metadata`, `owner_id`, `description` and `status`

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9003/groups -d '{"name": "<group_name>", "description": "<group_description>"}'
```

For example:

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups -d '{"name": "testgroup", "description": "test group description"}'

HTTP/1.1 201 Created
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 09:41:42 GMT
Content-Type: application/json
Content-Length: 252
Connection: keep-alive
Location: /groups/2766ae94-9a08-4418-82ce-3b91cf2ccd3e
Access-Control-Expose-Headers: Location

{
  "id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
  "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "name": "testgroup",
  "description": "test group description",
  "created_at": "2023-06-15T09:41:42.860481Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

When you use `parent_id` make sure the parent is an already exisiting group

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9003/groups -d '{"name": "<group_name>", "description": "<group_description>", "parent_id": "<parent_id>"}'
```

For example:

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups -d '{"name": "testgroup2", "description": "test group 2 description", "parent_id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e"}'

HTTP/1.1 201 Created
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 09:42:34 GMT
Content-Type: application/json
Content-Length: 306
Connection: keep-alive
Location: /groups/dd2dc8d4-f7cf-42f9-832b-81cae9a8e90a
Access-Control-Expose-Headers: Location

{
  "id": "dd2dc8d4-f7cf-42f9-832b-81cae9a8e90a",
  "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "parent_id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
  "name": "testgroup2",
  "description": "test group 2 description",
  "created_at": "2023-06-15T09:42:34.063997Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get group

Get a group entity for a logged in user

> Must-have: `user_token` and `group_id`

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9003/groups/<group_id>
```

For example:

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups/2766ae94-9a08-4418-82ce-3b91cf2ccd3e

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 10:00:52 GMT
Content-Type: application/json
Content-Length: 252
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
  "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "name": "testgroup",
  "description": "test group description",
  "created_at": "2023-06-15T09:41:42.860481Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get groups

You can get all groups for a logged in user.

If you want to paginate your results then use this `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` query parameters.

> Must-have: `user_token`

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9003/groups
```

For example:

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 10:13:50 GMT
Content-Type: application/json
Content-Length: 807
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "limit": 0,
  "offset": 0,
  "total": 3,
  "groups": [
    {
      "id": "0a4a2c33-2d0e-43df-b51c-d905aba99e17",
      "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
      "name": "a",
      "created_at": "2023-06-14T13:33:52.249784Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    },
    {
      "id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
      "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
      "name": "testgroup",
      "description": "test group description",
      "created_at": "2023-06-15T09:41:42.860481Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    },
    {
      "id": "dd2dc8d4-f7cf-42f9-832b-81cae9a8e90a",
      "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
      "parent_id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
      "name": "testgroup2",
      "description": "test group 2 description",
      "created_at": "2023-06-15T09:42:34.063997Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Get Group Parents

You can get all groups that are parents of a group for a logged in user.

If you want to paginate your results then use this `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` query parameters.

> Must-have: `user_token` and `group_id`

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9003/groups/<group_id>/parents
```

For example:

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups/dd2dc8d4-f7cf-42f9-832b-81cae9a8e90a/parents?tree=true

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 10:16:03 GMT
Content-Type: application/json
Content-Length: 627
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "limit": 10,
  "offset": 0,
  "total": 3,
  "groups": [
    {
      "id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
      "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
      "name": "testgroup",
      "description": "test group description",
      "level": -1,
      "children": [
        {
          "id": "dd2dc8d4-f7cf-42f9-832b-81cae9a8e90a",
          "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
          "parent_id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
          "name": "testgroup2",
          "description": "test group 2 description",
          "created_at": "2023-06-15T09:42:34.063997Z",
          "updated_at": "0001-01-01T00:00:00Z",
          "status": "enabled"
        }
      ],
      "created_at": "2023-06-15T09:41:42.860481Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Get Group Children

You can get all groups that are children of a group for a logged in user.

If you want to paginate your results then use this `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` query parameters.

> Must-have: `user_token`

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9003/groups/<group_id>/children
```

For example:

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups/2766ae94-9a08-4418-82ce-3b91cf2ccd3e/children?tree=true

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 10:17:13 GMT
Content-Type: application/json
Content-Length: 755
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "limit": 10,
  "offset": 0,
  "total": 3,
  "groups": [
    {
      "id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
      "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
      "name": "testgroup",
      "description": "test group description",
      "path": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
      "children": [
        {
          "id": "dd2dc8d4-f7cf-42f9-832b-81cae9a8e90a",
          "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
          "parent_id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
          "name": "testgroup2",
          "description": "test group 2 description",
          "level": 1,
          "path": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e.dd2dc8d4-f7cf-42f9-832b-81cae9a8e90a",
          "created_at": "2023-06-15T09:42:34.063997Z",
          "updated_at": "0001-01-01T00:00:00Z",
          "status": "enabled"
        }
      ],
      "created_at": "2023-06-15T09:41:42.860481Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Update group

Update group entity

> Must-have: `user_token` and `group_id`

```bash
curl -isS -X PUT -H "Content-Type: application/json" -H  "Authorization: Bearer <user_token>" http://localhost:9003/groups/<group_id> -d '{"name": "<group_name>"}'
```

For example:

```bash
curl -isS -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups/2766ae94-9a08-4418-82ce-3b91cf2ccd3e -d '{"name": "new name", "description": "new description", "metadata": {"foo":"bar"}}'

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 10:17:56 GMT
Content-Type: application/json
Content-Length: 328
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
  "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "name": "new name",
  "description": "new description",
  "metadata": { "foo": "bar" },
  "created_at": "2023-06-15T09:41:42.860481Z",
  "updated_at": "2023-06-15T10:17:56.475241Z",
  "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "status": "enabled"
}
```

## Disable group

Disable a group entity

> Must-have: `user_token` and `group_id`

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9003/groups/<group_id>/disable
```

For example:

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups/2766ae94-9a08-4418-82ce-3b91cf2ccd3e/disable

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 10:18:28 GMT
Content-Type: application/json
Content-Length: 329
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
  "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "name": "new name",
  "description": "new description",
  "metadata": { "foo": "bar" },
  "created_at": "2023-06-15T09:41:42.860481Z",
  "updated_at": "2023-06-15T10:17:56.475241Z",
  "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "status": "disabled"
}
```

## Enable group

Enable a group entity

> Must-have: `user_token` and `group_id`

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9003/groups/<group_id>/enable
```

For example:

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups/2766ae94-9a08-4418-82ce-3b91cf2ccd3e/enable

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 10:18:55 GMT
Content-Type: application/json
Content-Length: 328
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
  "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "name": "new name",
  "description": "new description",
  "metadata": { "foo": "bar" },
  "created_at": "2023-06-15T09:41:42.860481Z",
  "updated_at": "2023-06-15T10:17:56.475241Z",
  "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "status": "enabled"
}
```

## Assign

Assign user to a group

> Must-have: `user_token`, `group_id`, `member_id` and `member_action`

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost/users/policies -d '{"subject": "<user_id>", "object": "<group_id>", "actions":["<member_action>"]}'
```

For example:

```bash
curl -isS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost/users/policies -d '{"subject": "1890c034-7ef9-4cde-83df-d78ea1d4d281", "object": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e", "actions":["g_list", "c_list"]}'

HTTP/1.1 201 Created
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 10:19:59 GMT
Content-Type: application/json
Content-Length: 0
Connection: keep-alive
Access-Control-Expose-Headers: Location
```

## Members

You can get all users assigned to a group.

If you want to paginate your results then use this `offset`, `limit`, `metadata`, `name`, `status`, `identity`, and `tag` query parameters.

> Must-have: `user_token` and `group_id`
>
> Must take into consideration the user identified by the `user_token` needs to be assigned to the same group with `g_list` action or be the owner of the group.

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost:9003/groups/<group_id>/members
```

For example:

```bash
curl -isS -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost:9003/groups/2766ae94-9a08-4418-82ce-3b91cf2ccd3e/members

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 11:21:29 GMT
Content-Type: application/json
Content-Length: 318
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "limit": 10,
  "total": 1,
  "members": [
    {
      "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
      "name": "new name",
      "tags": ["foo", "bar"],
      "credentials": { "identity": "updated.john.doe@email.com", "secret": "" },
      "metadata": { "foo": "bar" },
      "created_at": "2023-06-14T13:46:47.322648Z",
      "updated_at": "2023-06-14T13:59:53.422595Z",
      "status": "enabled"
    }
  ]
}
```

## Unassign

Unassign user from group

> Must-have: `user_token`, `group_id` and `user_id`

```bash
curl -isS -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" http://localhost/users/policies -d '{"subject": "<user_id>", "object": "<group_id>"}'
```

For example:

```bash
curl -isS -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" http://localhost/users/policies -d '{"subject": "1890c034-7ef9-4cde-83df-d78ea1d4d281", "object": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e"}'

HTTP/1.1 204 No Content
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 11:25:27 GMT
Content-Type: application/json
Connection: keep-alive
Access-Control-Expose-Headers: Location
```
