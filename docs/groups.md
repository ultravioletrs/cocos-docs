# Groups

Groups are a logical way to group users together. Groups can be nested and have a parent-child relationship.

## Create group

```bash
curl -sSiX POST http://localhost:9003/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
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
curl -sSiX POST http://localhost:9003/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
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
Content-Type: application/json
Location: /groups/0c5bb86a-5545-4e5f-9169-d9a0bff92c95
Date: Wed, 02 Aug 2023 08:27:48 GMT
Content-Length: 331

{
  "id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
  "name": "confidential computing",
  "description": "confidential computing group",
  "metadata": { "location": "room 101", "meeting": "every monday" },
  "created_at": "2023-08-02T08:27:48.593109Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

When you use `parent_id` make sure the parent is an already exisiting group

For example:

```bash
curl -sSiX POST http://localhost:9003/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "name": "EU confidential computing",
  "description": "confidential computing group for EU",
  "parent_id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "metadata": {
    "meeting": "every tuesday",
    "location": "room 102"
  }
}
EOF

HTTP/1.1 201 Created
Content-Type: application/json
Location: /groups/eaf548b0-edf9-42da-98b5-28155ebac565
Date: Wed, 02 Aug 2023 08:28:44 GMT
Content-Length: 393

{
  "id": "eaf548b0-edf9-42da-98b5-28155ebac565",
  "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
  "parent_id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "name": "EU confidential computing",
  "description": "confidential computing group for EU",
  "metadata": { "location": "room 102", "meeting": "every tuesday" },
  "created_at": "2023-08-02T08:28:44.576817Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get group

```bash
curl -isS -X GET http://localhost:9003/groups/<group_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isS -X GET http://localhost:9003/groups/0c5bb86a-5545-4e5f-9169-d9a0bff92c95 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:29:07 GMT
Content-Length: 331

{
  "id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
  "name": "confidential computing",
  "description": "confidential computing group",
  "metadata": { "location": "room 101", "meeting": "every monday" },
  "created_at": "2023-08-02T08:27:48.593109Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get groups

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` as query parameters.

```bash
curl -isS -X GET http://localhost:9003/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isS -X GET http://localhost:9003/groups -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:29:24 GMT
Content-Length: 768

{
  "limit": 0,
  "offset": 0,
  "total": 2,
  "groups": [
    {
      "id": "eaf548b0-edf9-42da-98b5-28155ebac565",
      "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
      "parent_id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
      "name": "EU confidential computing",
      "description": "confidential computing group for EU",
      "metadata": { "location": "room 102", "meeting": "every tuesday" },
      "created_at": "2023-08-02T08:28:44.576817Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    },
    {
      "id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
      "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
      "name": "confidential computing",
      "description": "confidential computing group",
      "metadata": { "location": "room 101", "meeting": "every monday" },
      "created_at": "2023-08-02T08:27:48.593109Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Get Group Parents

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` as query parameters.

```bash
curl -isS -X GET http://localhost:9003/groups/<group_id>/parents  -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isS -X GET http://localhost:9003/groups/eaf548b0-edf9-42da-98b5-28155ebac565/parents?tree=true  -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:30:04 GMT
Content-Length: 793

{
  "limit": 10,
  "offset": 0,
  "total": 2,
  "groups": [
    {
      "id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
      "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
      "name": "confidential computing",
      "description": "confidential computing group",
      "metadata": { "location": "room 101", "meeting": "every monday" },
      "level": -1,
      "children": [
        {
          "id": "eaf548b0-edf9-42da-98b5-28155ebac565",
          "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
          "parent_id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
          "name": "EU confidential computing",
          "description": "confidential computing group for EU",
          "metadata": { "location": "room 102", "meeting": "every tuesday" },
          "created_at": "2023-08-02T08:28:44.576817Z",
          "updated_at": "0001-01-01T00:00:00Z",
          "status": "enabled"
        }
      ],
      "created_at": "2023-08-02T08:27:48.593109Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Get Group Children

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` as query parameters.

```bash
curl -isS -X GET http://localhost:9003/groups/<group_id>/children -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:30:28 GMT
Content-Length: 921

{
  "limit": 10,
  "offset": 0,
  "total": 2,
  "groups": [
    {
      "id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
      "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
      "name": "confidential computing",
      "description": "confidential computing group",
      "metadata": { "location": "room 101", "meeting": "every monday" },
      "path": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
      "children": [
        {
          "id": "eaf548b0-edf9-42da-98b5-28155ebac565",
          "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
          "parent_id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
          "name": "EU confidential computing",
          "description": "confidential computing group for EU",
          "metadata": { "location": "room 102", "meeting": "every tuesday" },
          "level": 1,
          "path": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95.eaf548b0-edf9-42da-98b5-28155ebac565",
          "created_at": "2023-08-02T08:28:44.576817Z",
          "updated_at": "0001-01-01T00:00:00Z",
          "status": "enabled"
        }
      ],
      "created_at": "2023-08-02T08:27:48.593109Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Update group

Update group entity

```bash
curl -sSiX PUT http://localhost:9003/groups/<group_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
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
curl -sSiX PUT http://localhost:9003/groups/0c5bb86a-5545-4e5f-9169-d9a0bff92c95 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
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
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:30:51 GMT
Content-Length: 406

{
  "id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
  "name": "updated confidential computing",
  "description": "updated confidential computing group",
  "metadata": { "location": "room 809", "meeting": "every friday" },
  "created_at": "2023-08-02T08:27:48.593109Z",
  "updated_at": "2023-08-02T08:30:51.399697Z",
  "updated_by": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
  "status": "enabled"
}
```

## Disable group

Disable a group entity

```bash
curl -isS -X POST http://localhost:9003/groups/<group_id>/disable -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isS -X POST http://localhost:9003/groups/0c5bb86a-5545-4e5f-9169-d9a0bff92c95/disable -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:31:13 GMT
Content-Length: 407

{
  "id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
  "name": "updated confidential computing",
  "description": "updated confidential computing group",
  "metadata": { "location": "room 809", "meeting": "every friday" },
  "created_at": "2023-08-02T08:27:48.593109Z",
  "updated_at": "2023-08-02T08:30:51.399697Z",
  "updated_by": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
  "status": "disabled"
}
```

## Enable group

Enable a group entity

```bash
curl -isS -X POST http://localhost:9003/groups/<group_id>/enable -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isS -X POST http://localhost:9003/groups/0c5bb86a-5545-4e5f-9169-d9a0bff92c95/enable -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:31:29 GMT
Content-Length: 406

{
  "id": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "owner_id": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
  "name": "updated confidential computing",
  "description": "updated confidential computing group",
  "metadata": { "location": "room 809", "meeting": "every friday" },
  "created_at": "2023-08-02T08:27:48.593109Z",
  "updated_at": "2023-08-02T08:30:51.399697Z",
  "updated_by": "dbec6755-8af5-4ce5-a042-8966b90ad84a",
  "status": "enabled"
}
```

## Assign

Assign user to a group

```bash
curl -sSiX POST http://localhost:9003/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "<user_id>",
  "object": "<group_id>",
  "actions": ["<member_action>"]
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost:9003/policies -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- << EOF
{
  "subject": "55bdf567-3595-42c6-8aa6-4091fdcc88da",
  "object": "0c5bb86a-5545-4e5f-9169-d9a0bff92c95",
  "actions": ["g_list", "c_list"]
}
EOF

HTTP/1.1 201 Created
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:32:40 GMT
Content-Length: 0
```

## Members

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` as query parameters.

> Must take into consideration the user identified by the `user_token` needs to be assigned to the same group identified by `group_id` with `g_list` action or be the owner of the group identified by `group_id`.

```bash
curl -isS -X GET http://localhost:9003/groups/<group_id>/members -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -isS -X GET http://localhost:9003/groups/0c5bb86a-5545-4e5f-9169-d9a0bff92c95/members -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:32:59 GMT
Content-Length: 263

{
  "limit": 10,
  "total": 1,
  "members": [
    {
      "id": "55bdf567-3595-42c6-8aa6-4091fdcc88da",
      "name": "example user 2",
      "credentials": { "identity": "example2@cocos.com", "secret": "" },
      "created_at": "2023-08-02T08:27:19.465767Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Unassign

Unassign user from group

```bash
curl -sSiX DELETE http://localhost:9003/policies/<user_id>/<group_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX DELETE http://localhost:9003/policies/55bdf567-3595-42c6-8aa6-4091fdcc88da/0c5bb86a-5545-4e5f-9169-d9a0bff92c95 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>"

HTTP/1.1 204 No Content
Content-Type: application/json
Date: Wed, 02 Aug 2023 08:34:13 GMT
```
