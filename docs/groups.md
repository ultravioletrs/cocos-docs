# Groups

Group represents a logical groupping of users. It is used to simplify access control management by allowing users to be grouped together. When assigning a user to a group, we create a policy that defines what that user can do with the resources of the group. This way, a user can be assigned to multiple groups, and each group can have multiple users assigned to it. Users in one group have access to other users in the same group as long as they have the required policy. A group can also be assigned to another group, thus creating a group hierarchy. When assigning a user to a group we create a policy that defines what that user can do with the group and other users in the group.

## Create group

```bash
curl -sSiX POST http://localhost/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "<group_name>",
  "description": "[group_description]",
  "parent_id": "[parent_id]",
  "metadata": {
    "key": "value"
  },
  "owner_id": "[owner_id]",
  "status": "[status]"
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "confidential computing",
  "description": "confidential computing group",
  "metadata": {
    "meeting": "every monday",
    "location": "room 101"
  }
}
EOF

HTTP/1.1 201 Created
Content-Length: 331
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:03:34 GMT
Location: /groups/b19c8738-0efa-400e-aaf0-610ef42f1ee1
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "confidential computing",
  "description": "confidential computing group",
  "metadata": { "location": "room 101", "meeting": "every monday" },
  "created_at": "2023-08-10T08:03:34.204862Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

When you use `parent_id` make sure the parent is an already exisiting group

For example:

```bash
curl -sSiX POST http://localhost/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "EU confidential computing",
  "description": "confidential computing group for EU",
  "parent_id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "metadata": {
    "meeting": "every tuesday",
    "location": "room 102"
  }
}
EOF

HTTP/1.1 201 Created
Content-Length: 393
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:03:58 GMT
Location: /groups/e2aba2d7-1f82-4b13-b010-dc0aa3a228a0
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "e2aba2d7-1f82-4b13-b010-dc0aa3a228a0",
  "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "parent_id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "name": "EU confidential computing",
  "description": "confidential computing group for EU",
  "metadata": { "location": "room 102", "meeting": "every tuesday" },
  "created_at": "2023-08-10T08:03:57.994226Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get group

```bash
curl -isSX GET http://localhost/groups/<group_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET http://localhost/groups/b19c8738-0efa-400e-aaf0-610ef42f1ee1 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 331
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:04:32 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "confidential computing",
  "description": "confidential computing group",
  "metadata": { "location": "room 101", "meeting": "every monday" },
  "created_at": "2023-08-10T08:03:34.204862Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get groups

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` as query parameters.

```bash
curl -isSX GET http://localhost/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET http://localhost/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 768
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:04:47 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 0,
  "offset": 0,
  "total": 2,
  "groups": [
    {
      "id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
      "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
      "name": "confidential computing",
      "description": "confidential computing group",
      "metadata": { "location": "room 101", "meeting": "every monday" },
      "created_at": "2023-08-10T08:03:34.204862Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    },
    {
      "id": "e2aba2d7-1f82-4b13-b010-dc0aa3a228a0",
      "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
      "parent_id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
      "name": "EU confidential computing",
      "description": "confidential computing group for EU",
      "metadata": { "location": "room 102", "meeting": "every tuesday" },
      "created_at": "2023-08-10T08:03:57.994226Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Get Group Parents

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` as query parameters.

```bash
curl -isSX GET http://localhost/groups/<group_id>/parents  -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET http://localhost/groups/e2aba2d7-1f82-4b13-b010-dc0aa3a228a0/parents?tree=true  -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 793
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:05:25 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 10,
  "offset": 0,
  "total": 2,
  "groups": [
    {
      "id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
      "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
      "name": "confidential computing",
      "description": "confidential computing group",
      "metadata": { "location": "room 101", "meeting": "every monday" },
      "level": -1,
      "children": [
        {
          "id": "e2aba2d7-1f82-4b13-b010-dc0aa3a228a0",
          "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
          "parent_id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
          "name": "EU confidential computing",
          "description": "confidential computing group for EU",
          "metadata": { "location": "room 102", "meeting": "every tuesday" },
          "created_at": "2023-08-10T08:03:57.994226Z",
          "updated_at": "0001-01-01T00:00:00Z",
          "status": "enabled"
        }
      ],
      "created_at": "2023-08-10T08:03:34.204862Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Get Group Children

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` as query parameters.

```bash
curl -isSX GET http://localhost/groups/<group_id>/children -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET http://localhost/groups/b19c8738-0efa-400e-aaf0-610ef42f1ee1/children?tree=true&dir=-1 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 921
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:05:51 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 10,
  "offset": 0,
  "total": 2,
  "groups": [
    {
      "id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
      "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
      "name": "confidential computing",
      "description": "confidential computing group",
      "metadata": { "location": "room 101", "meeting": "every monday" },
      "path": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
      "children": [
        {
          "id": "e2aba2d7-1f82-4b13-b010-dc0aa3a228a0",
          "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
          "parent_id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
          "name": "EU confidential computing",
          "description": "confidential computing group for EU",
          "metadata": { "location": "room 102", "meeting": "every tuesday" },
          "level": 1,
          "path": "b19c8738-0efa-400e-aaf0-610ef42f1ee1.e2aba2d7-1f82-4b13-b010-dc0aa3a228a0",
          "created_at": "2023-08-10T08:03:57.994226Z",
          "updated_at": "0001-01-01T00:00:00Z",
          "status": "enabled"
        }
      ],
      "created_at": "2023-08-10T08:03:34.204862Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Update group

Update group entity

```bash
curl -sSiX PUT http://localhost/groups/<group_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "<group_name>",
  "description": "<group_description>",
  "metadata": {
    "<key>": "<value>"
  }
}
EOF
```

For example:

```bash
curl -sSiX PUT http://localhost/groups/b19c8738-0efa-400e-aaf0-610ef42f1ee1 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "updated confidential computing",
  "description": "updated confidential computing group",
  "metadata": {
    "meeting": "every friday",
    "location": "room 809"
  }
}
EOF

HTTP/1.1 200 OK
Content-Length: 406
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:06:09 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "updated confidential computing",
  "description": "updated confidential computing group",
  "metadata": { "location": "room 809", "meeting": "every friday" },
  "created_at": "2023-08-10T08:03:34.204862Z",
  "updated_at": "2023-08-10T08:06:09.289907Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "enabled"
}
```

## Disable group

Disable a group entity

```bash
curl -isSX POST http://localhost/groups/<group_id>/disable -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX POST http://localhost/groups/b19c8738-0efa-400e-aaf0-610ef42f1ee1/disable -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 407
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:06:23 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "updated confidential computing",
  "description": "updated confidential computing group",
  "metadata": { "location": "room 809", "meeting": "every friday" },
  "created_at": "2023-08-10T08:03:34.204862Z",
  "updated_at": "2023-08-10T08:06:09.289907Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "disabled"
}
```

## Enable group

Enable a group entity

```bash
curl -isSX POST http://localhost/groups/<group_id>/enable -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX POST http://localhost/groups/b19c8738-0efa-400e-aaf0-610ef42f1ee1/enable -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 406
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:06:36 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "b19c8738-0efa-400e-aaf0-610ef42f1ee1",
  "owner_id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "updated confidential computing",
  "description": "updated confidential computing group",
  "metadata": { "location": "room 809", "meeting": "every friday" },
  "created_at": "2023-08-10T08:03:34.204862Z",
  "updated_at": "2023-08-10T08:06:09.289907Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "enabled"
}
```

## Assign

Assign user to a group

```bash
curl -sSiX POST http://localhost/users/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "<user_id>",
  "object": "<group_id>",
  "actions": ["<member_action>"]
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
Date: Thu, 10 Aug 2023 08:07:26 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```

## Members

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` as query parameters.

> Must take into consideration the user identified by the `user_token` needs to be assigned to the same group identified by `group_id` with `g_list` action or be the owner of the group identified by `group_id`.

```bash
curl -isSX GET http://localhost/groups/<group_id>/members -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isSX GET http://localhost/groups/b19c8738-0efa-400e-aaf0-610ef42f1ee1/members -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 246
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:11:12 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 10,
  "total": 1,
  "members": [
    {
      "id": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
      "name": "John Doe",
      "credentials": { "identity": "john.doe2@email.com" },
      "created_at": "2023-08-10T07:55:08.056426Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Unassign

Unassign user from group

```bash
curl -sSiX DELETE http://localhost/users/policies/<user_id>/<group_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX DELETE http://localhost/users/policies/47887629-7b4c-4bf5-b414-35bb2a5f5f23/b19c8738-0efa-400e-aaf0-610ef42f1ee1 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:13:40 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block
```
