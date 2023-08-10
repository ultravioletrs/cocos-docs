# Users

## Create User

> Identity, which can be email-address (this must be unique as it identifies the user) and secret (password must contain at least 8 characters)

```bash
curl -sSiX POST http://localhost/users -H "Content-Type: application/json" [-H "Authorization: Bearer <user_token>"] -d @- <<EOF
{
  "name": "[name]",
  "credentials": {
    "identity": "<identity>",
    "secret": "<secret>"
  },
  "tags": [
    "[tag_1]", ..., "[tag_N]"
  ],
  "owner": "[owner_id]",
  "metadata": {},
  "status": "[status]",
  "role": "[role]"
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost/users -H "Content-Type: application/json" -d @- <<EOF
{
  "name": "John Doe",
  "credentials": {
    "identity": "john.doe@email.com",
    "secret": "12345678"
  }
}
EOF

HTTP/1.1 201 Created
Content-Length: 210
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:34:48 GMT
Location: /users/246acee8-0bc4-4b2e-9f2c-3fdee3776d45
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "246acee8-0bc4-4b2e-9f2c-3fdee3776d45",
  "name": "John Doe",
  "credentials": { "identity": "john.doe@email.com" },
  "created_at": "2023-08-10T07:34:48.729683Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

You can also use `<user_token>` so that the owner of the new user is the one identified by the `<user_token>` for example:

```bash
curl -sSiX POST http://localhost/users -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "John Doe",
  "credentials": {
    "identity": "john.doe2@email.com",
    "secret": "12345678"
  }
}
EOF

HTTP/1.1 201 Created
Content-Length: 258
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:55:08 GMT
Location: /users/47887629-7b4c-4bf5-b414-35bb2a5f5f23
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
  "name": "John Doe",
  "owner": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "credentials": { "identity": "john.doe2@email.com" },
  "created_at": "2023-08-10T07:55:08.056426Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Create Token

To log in to the Mainflux system, you need to create a `user_token`.

```bash
curl -sSiX POST http://localhost/users/tokens/issue -H "Content-Type: application/json" -d @- <<EOF
{
  "identity": "<user_identity>",
  "secret": "<user_secret>"
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost/users/tokens/issue -H "Content-Type: application/json" -d @- <<EOF
{
  "identity": "john.doe@email.com",
  "secret": "12345678"
}
EOF

HTTP/1.1 201 Created
Content-Length: 709
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:54:50 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTE2NTU4ODksImlhdCI6MTY5MTY1NDA4OSwiaWRlbnRpdHkiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiIxMWEyYTViYS03MjNhLTRiNmQtOGE1ZC0wYzY3OWVmYmYyODMiLCJ0eXBlIjoiYWNjZXNzIn0.aH2CisuijBrhmecNarZ8yyA_7fiu3He3UwGTaZNnLDLNJihbq82cCegnJJnCZ5wKI2r6FlmB8FaIJbAFydRG1g",
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTE3NDA0ODksImlhdCI6MTY5MTY1NDA4OSwiaWRlbnRpdHkiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiIxMWEyYTViYS03MjNhLTRiNmQtOGE1ZC0wYzY3OWVmYmYyODMiLCJ0eXBlIjoicmVmcmVzaCJ9.ocr4zQ1GbNyGVy_mSNsn7TOjt3VVuYfiNk030EaBJ-VoWe4FPWLCIiCRWD_XIdL8RZ-aq3Y4FQ2MkuZhvUe9BQ",
  "access_type": "Bearer"
}
```

## Refresh Token

To issue another `access_token` after getting expired, you need to use a `refresh_token`.

```bash
curl -sSiX POST http://localhost/users/tokens/refresh -H "Content-Type: application/json" -H "Authorization: Bearer <refresh_token>"
```

For example:

```bash
curl -sSiX POST http://localhost/users/tokens/refresh -H "Content-Type: application/json" -H "Authorization: Bearer <refresh_token>"


HTTP/1.1 201 Created
Content-Length: 709
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:55:20 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTE2NTQ4NDAsImlhdCI6MTY5MTY1MzA0MCwiaWRlbnRpdHkiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiIyNDZhY2VlOC0wYmM0LTRiMmUtOWYyYy0zZmRlZTM3NzZkNDUiLCJ0eXBlIjoiYWNjZXNzIn0.Sn4r41hl1pBFjm95UCr23hGabgq62cxNV882EiV8RMZqv92RJYMcm27KFCcR6fN07jMTXFVr_DDxc9be1HAXgw",
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTE3Mzk0NDAsImlhdCI6MTY5MTY1MzA0MCwiaWRlbnRpdHkiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiIyNDZhY2VlOC0wYmM0LTRiMmUtOWYyYy0zZmRlZTM3NzZkNDUiLCJ0eXBlIjoicmVmcmVzaCJ9.As2C8mCp2BaSdm5yp5OUMNiJ7gHJT472e-L7T80xVHhrqDMBvsom7o4_RfP1z7A2sHrkA4ozU4B-FUSaSeG32A",
  "access_type": "Bearer"
}
```

## Get User Profile

```bash
curl -sSiX GET http://localhost/users/profile -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX GET http://localhost/users/profile -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 209
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:56:07 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "John Doe",
  "credentials": { "identity": "john.doe@email.com" },
  "created_at": "2023-08-10T07:54:38.84894Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get User

```bash
curl -sSiX GET http://localhost/users/<user_id> -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX GET http://localhost/users/11a2a5ba-723a-4b6d-8a5d-0c679efbf283 -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 209
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:56:30 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "John Doe",
  "credentials": { "identity": "john.doe@email.com" },
  "created_at": "2023-08-10T07:54:38.84894Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get Users

You can get all users in the database by querying `/users` endpoint.

```bash
curl -sSiX GET http://localhost/users -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX GET http://localhost/users -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 291
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:56:42 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 10,
  "total": 1,
  "users": [
    {
      "id": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
      "name": "John Doe",
      "owner": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
      "credentials": { "identity": "john.doe2@email.com" },
      "created_at": "2023-08-10T07:55:08.056426Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `identity`, `tag`, `status` and `visbility` as query parameters.

```bash
curl -sSiX GET -H "Authorization: Bearer <user_token>" http://localhost/users?offset=[offset]&limit=[limit]&identity=[identity]
```

For example:

```bash
curl -sSiX GET -H "Authorization: Bearer <user_token>" http://localhost/users?offset=0&limit=5&identity=john.doe2@email.com

HTTP/1.1 200 OK
Content-Length: 290
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:56:57 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 5,
  "total": 1,
  "users": [
    {
      "id": "47887629-7b4c-4bf5-b414-35bb2a5f5f23",
      "name": "John Doe",
      "owner": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
      "credentials": { "identity": "john.doe2@email.com" },
      "created_at": "2023-08-10T07:55:08.056426Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Update User

Updating user's name and/or metadata

```bash
curl -sSiX PATCH  http://localhost/users/<user_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "[name]",
  "metadata": {}
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost/users/11a2a5ba-723a-4b6d-8a5d-0c679efbf283 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "new name",
  "metadata": {
    "depertment": "confidential-computing"
  }
}
EOF

HTTP/1.1 200 OK
Content-Length: 391
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:57:17 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "new name",
  "credentials": {
    "identity": "john.doe@email.com"
  },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-08-10T07:54:38.84894Z",
  "updated_at": "2023-08-10T07:57:17.088923Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "enabled"
}
```

## Update User Tags

Updating user's tags

```bash
curl -sSiX PATCH http://localhost/users/<user_id>/tags -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "tags": ["<tag_1>", ..., "tag_N"]
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost/users/11a2a5ba-723a-4b6d-8a5d-0c679efbf283/tags -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "tags": ["manager", "developer"]
}
EOF

HTTP/1.1 200 OK
Content-Length: 349
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:58:17 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "new name",
  "tags": ["manager", "developer"],
  "credentials": { "identity": "john.doe@email.com" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-08-10T07:54:38.84894Z",
  "updated_at": "2023-08-10T07:58:17.37807Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "enabled"
}
```

## Update User Owner

Updating user's owner

```bash
curl -sSiX PATCH http://localhost/users/<user_id>/owner -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "owner": "<owner_id>"
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost/users/11a2a5ba-723a-4b6d-8a5d-0c679efbf283/owner -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "owner": "532311a4-c13b-4061-b991-98dcae7a934e"
}
EOF

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:56:32 GMT
Content-Type: application/json
Content-Length: 375
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "new name",
  "tags": ["manager", "developer"],
  "owner": "532311a4-c13b-4061-b991-98dcae7a934e",
  "credentials": { "identity": "john.doe@email.com" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-08-10T07:54:38.84894Z",
  "updated_at": "2023-08-10T07:58:17.37807Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "enabled"
}
```

## Update User Identity

Updating user's identity

```bash
curl -sSiX PATCH http://localhost/users/<user_id>/identity -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "identity": "<identity>"
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost/users/11a2a5ba-723a-4b6d-8a5d-0c679efbf283/identity -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "identity": "jane.doe@email.com"
}
EOF

HTTP/1.1 200 OK
Content-Length: 350
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:58:46 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "new name",
  "tags": ["manager", "developer"],
  "credentials": { "identity": "jane.doe@email.com" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-08-10T07:54:38.84894Z",
  "updated_at": "2023-08-10T07:58:46.723802Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "enabled"
}
```

## Change Secret

Changing the user secret can be done by calling the update secret function

```bash
curl -sSiX PATCH http://localhost/users/secret -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "old_secret": "<old_secret>",
  "new_secret": "<new_secret>"
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost/users/secret -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "old_secret": "12345678",
  "new_secret": "123456789"
}
EOF

HTTP/1.1 200 OK
Content-Length: 350
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:59:03 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "new name",
  "tags": ["manager", "developer"],
  "credentials": { "identity": "jane.doe@email.com" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-08-10T07:54:38.84894Z",
  "updated_at": "2023-08-10T07:59:03.603003Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "enabled"
}
```

## Enable User

Changing the user status to enabled can be done by calling the enable user function

```bash
curl -sSiX GET http://localhost/users/<user_id>/enable -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX POST http://localhost/users/11a2a5ba-723a-4b6d-8a5d-0c679efbf283/enable -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 350
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:59:55 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "new name",
  "tags": ["manager", "developer"],
  "credentials": { "identity": "jane.doe@email.com" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-08-10T07:54:38.84894Z",
  "updated_at": "2023-08-10T07:59:03.603003Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "enabled"
}
```

## Disable User

Changing the user status to disabled can be done by calling the disable user function

```bash
curl -sSiX GET http://localhost/users/<user_id>/disable -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX POST http://localhost/users/11a2a5ba-723a-4b6d-8a5d-0c679efbf283/disable -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 351
Content-Type: application/json
Date: Thu, 10 Aug 2023 07:59:41 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "id": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "name": "new name",
  "tags": ["manager", "developer"],
  "credentials": { "identity": "jane.doe@email.com" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-08-10T07:54:38.84894Z",
  "updated_at": "2023-08-10T07:59:03.603003Z",
  "updated_by": "11a2a5ba-723a-4b6d-8a5d-0c679efbf283",
  "status": "disabled"
}
```

## Get User Memberships

You can get all groups a user is assigned to by calling the get user memberships function.

To paginate the results, use `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` as query parameters.

> Must take into consideration the user identified by the `user_token` needs to be assigned to the same group with `c_list` action or is the owner of the user identified by the `user_id`.

```bash
curl -sSiX GET http://localhost/users/<user_id>/memberships  -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX GET http://localhost/users/47887629-7b4c-4bf5-b414-35bb2a5f5f23/memberships  -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Content-Length: 445
Content-Type: application/json
Date: Thu, 10 Aug 2023 08:13:53 GMT
X-Frame-Options: DENY
X-Xss-Protection: 1; mode=block

{
  "limit": 0,
  "offset": 0,
  "memberships": [
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
  ]
}
```
