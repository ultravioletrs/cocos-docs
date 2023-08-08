# Users

## Create User

> Identity, which can be email-address (this must be unique as it identifies the user) and secret (password must contain at least 8 characters)

```bash
curl -sSiX POST http://localhost:9003/users -H "Content-Type: application/json" -H "Authorization: Bearer [user_token]" -d @- <<EOF
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
curl -sSiX POST http://localhost:9003/users -H "Content-Type: application/json" -d @- <<EOF
{
  "name": "John Doe",
  "credentials": {
    "identity": "john.doe@email.com",
    "secret": "12345678"
  }
}
EOF

HTTP/1.1 201 Created
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:45:38 GMT
Content-Type: application/json
Content-Length: 223
Connection: keep-alive
Location: /users/4f22fa45-50ca-491b-a7c9-680a2608dc13
Access-Control-Expose-Headers: Location

{
  "id": "4f22fa45-50ca-491b-a7c9-680a2608dc13",
  "name": "John Doe",
  "credentials": { "identity": "john.doe@email.com", "secret": "" },
  "created_at": "2023-06-14T13:45:38.808423Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

You can also use `[user_token]` so that the owner of the new user is the one identified by the `[user_token]` for example:

```bash
curl -sSiX POST http://localhost:9003/users -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "John Doe",
  "credentials": {
    "identity": "john.doe2@email.com",
    "secret": "12345678"
  }
}
EOF

HTTP/1.1 201 Created
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:46:47 GMT
Content-Type: application/json
Content-Length: 252
Connection: keep-alive
Location: /users/1890c034-7ef9-4cde-83df-d78ea1d4d281
Access-Control-Expose-Headers: Location

{
  "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
  "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "credentials": { "identity": "john.doe2@email.com", "secret": "" },
  "created_at": "2023-06-14T13:46:47.322648Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Create Token

To log in to the Mainflux system, you need to create a `user_token`.

```bash
curl -sSiX POST http://localhost:9003/users/tokens/issue -H "Content-Type: application/json" -d @- <<EOF
{
  "identity": "<user_identity>",
  "secret": "<user_secret>"
}
EOF
```

For example:

```bash
curl -sSiX POST http://localhost:9003/users/tokens/issue -H "Content-Type: application/json" -d @- <<EOF
{
  "identity": "john.doe@email.com",
  "secret": "12345678"
}
EOF

HTTP/1.1 201 Created
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:47:32 GMT
Content-Type: application/json
Content-Length: 709
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODY3NTEzNTIsImlhdCI6MTY4Njc1MDQ1MiwiaWRlbnRpdHkiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiI5NDkzOTE1OS1kMTI5LTRmMTctOWU0ZS1jYzJkNjE1NTM5ZDciLCJ0eXBlIjoiYWNjZXNzIn0.AND1sm6mN2wgUxVkDhpipCoNa87KPMghGaS5-4dU0iZaqGIUhWScrEJwOahT9ts1TZSd1qEcANTIffJ_y2Pbsg",
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODY4MzY4NTIsImlhdCI6MTY4Njc1MDQ1MiwiaWRlbnRpdHkiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiI5NDkzOTE1OS1kMTI5LTRmMTctOWU0ZS1jYzJkNjE1NTM5ZDciLCJ0eXBlIjoicmVmcmVzaCJ9.z3OWCHhNHNuvkzBqEAoLKWS6vpFLkIYXhH9cZogSCXd109-BbKVlLvYKmja-hkhaj_XDJKySDN3voiazBr_WTA",
  "access_type": "Bearer"
}
```

## Refresh Token

To issue another `access_token` after getting expired, you need to use a `refresh_token`.

```bash
curl -sSiX POST http://localhost:9003/users/tokens/refresh -H "Content-Type: application/json" -H "Authorization: Bearer <refresh_token>"
```

For example:

```bash
curl -sSiX POST http://localhost:9003/users/tokens/refresh -H "Content-Type: application/json" -H "Authorization: Bearer <refresh_token>"


HTTP/1.1 201 Created
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:49:45 GMT
Content-Type: application/json
Content-Length: 709
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODY3NTE0ODUsImlhdCI6MTY4Njc1MDU4NSwiaWRlbnRpdHkiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiI5NDkzOTE1OS1kMTI5LTRmMTctOWU0ZS1jYzJkNjE1NTM5ZDciLCJ0eXBlIjoiYWNjZXNzIn0.zZcUH12x7Tlnecrc3AAFnu3xbW4wAOGifWZMnba2EnhosHWDuSN4N7s2S7OxPOrBGAG_daKvkA65mi5n1sxi9A",
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODY4MzY5ODUsImlhdCI6MTY4Njc1MDU4NSwiaWRlbnRpdHkiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpc3MiOiJjbGllbnRzLmF1dGgiLCJzdWIiOiI5NDkzOTE1OS1kMTI5LTRmMTctOWU0ZS1jYzJkNjE1NTM5ZDciLCJ0eXBlIjoicmVmcmVzaCJ9.AjxJ5xlUUSjW99ECUAU19ONeCs8WlRl52Ost2qGTADxHGYBjPMqctruyoTYJbdORtL5f2RTxZsnLX_1vLKRY2A",
  "access_type": "Bearer"
}
```

## Get User Profile

```bash
curl -sSiX GET http://localhost:9003/users/profile -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX GET http://localhost:9003/users/profile -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:51:59 GMT
Content-Type: application/json
Content-Length: 312
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
  "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "credentials": {
    "identity": "john.doe2@email.com",
    "secret": "$2a$10$pgpEKv0K5Xs9ULyBCVzGyeBwWIUleIH5IqXZ4XnLI6/.Aw2CHujr."
  },
  "created_at": "2023-06-14T13:46:47.322648Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get User

```bash
curl -sSiX GET http://localhost:9003/users/<user_id> -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX GET http://localhost:9003/users/1890c034-7ef9-4cde-83df-d78ea1d4d281 -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:51:59 GMT
Content-Type: application/json
Content-Length: 312
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
  "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "credentials": {
    "identity": "john.doe2@email.com",
    "secret": "$2a$10$pgpEKv0K5Xs9ULyBCVzGyeBwWIUleIH5IqXZ4XnLI6/.Aw2CHujr."
  },
  "created_at": "2023-06-14T13:46:47.322648Z",
  "updated_at": "0001-01-01T00:00:00Z",
  "status": "enabled"
}
```

## Get Users

You can get all users in the database by querying this endpoint.

```bash
curl -sSiX GET http://localhost:9003/users -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX GET http://localhost:9003/users -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:52:36 GMT
Content-Type: application/json
Content-Length: 285
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "limit": 10,
  "total": 1,
  "users": [
    {
      "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
      "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
      "credentials": { "identity": "john.doe2@email.com", "secret": "" },
      "created_at": "2023-06-14T13:46:47.322648Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

If you want to paginate your results then use this

> Additional parameters: `offset`, `limit`, `metadata`, `name`, `identity`, `tag`, `status` and `visbility`

```bash
curl -sSiX GET -H "Authorization: Bearer <user_token>" http://localhost:9003/users?offset=[offset]&limit=[limit]&identity=[identity]
```

For example:

```bash
curl -sSiX GET -H "Authorization: Bearer <user_token>" http://localhost:9003/users?offset=0&limit=5&identity=john.doe2@email.com

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:53:16 GMT
Content-Type: application/json
Content-Length: 284
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "limit": 5,
  "total": 1,
  "users": [
    {
      "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
      "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
      "credentials": { "identity": "john.doe2@email.com", "secret": "" },
      "created_at": "2023-06-14T13:46:47.322648Z",
      "updated_at": "0001-01-01T00:00:00Z",
      "status": "enabled"
    }
  ]
}
```

## Update User

Updating user's name and/or metadata

```bash
curl -sSiX PATCH  http://localhost:9003/users/<user_id> -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "[name]",
  "metadata": {}
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost:9003/users/1890c034-7ef9-4cde-83df-d78ea1d4d281 -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "name": "new name",
  "metadata": {
    "depertment": "confidential-computing"
  }
}
EOF

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:54:40 GMT
Content-Type: application/json
Content-Length: 354
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
  "name": "new name",
  "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "credentials": { "identity": "john.doe2@email.com", "secret": "" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-06-14T13:46:47.322648Z",
  "updated_at": "2023-06-14T13:54:40.208005Z",
  "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "status": "enabled"
}
```

## Update User Tags

Updating user's tags

```bash
curl -sSiX PATCH http://localhost:9003/users/<user_id>/tags -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "tags": ["<tag_1>", ..., "tag_N"]
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost:9003/users/1890c034-7ef9-4cde-83df-d78ea1d4d281/tags -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "tags": ["manager", "developer"]
}
EOF

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:55:18 GMT
Content-Type: application/json
Content-Length: 375
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
  "name": "new name",
  "tags": ["manager", "developer"],
  "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "credentials": { "identity": "john.doe2@email.com", "secret": "" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-06-14T13:46:47.322648Z",
  "updated_at": "2023-06-14T13:55:18.353027Z",
  "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "status": "enabled"
}
```

## Update User Owner

Updating user's owner

```bash
curl -sSiX PATCH http://localhost:9003/users/<user_id>/owner -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "owner": "<owner_id>"
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost:9003/users/1890c034-7ef9-4cde-83df-d78ea1d4d281/owner -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
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
  "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
  "name": "new name",
  "tags": ["manager", "developer"],
  "owner": "532311a4-c13b-4061-b991-98dcae7a934e",
  "credentials": { "identity": "john.doe2@email.com", "secret": "" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-06-14T13:46:47.322648Z",
  "updated_at": "2023-06-14T13:56:32.059484Z",
  "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "status": "enabled"
}
```

## Update User Identity

Updating user's identity

```bash
curl -sSiX PATCH http://localhost:9003/users/<user_id>/identity -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "identity": "<identity>"
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost:9003/users/1890c034-7ef9-4cde-83df-d78ea1d4d281/identity -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "identity": "john.doe@email.com"
}
EOF

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 13:59:53 GMT
Content-Type: application/json
Content-Length: 382
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
  "name": "new name",
  "tags": ["manager", "developer"],
  "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "credentials": { "identity": "updated.john.doe@email.com", "secret": "" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-06-14T13:46:47.322648Z",
  "updated_at": "2023-06-14T13:59:53.422595Z",
  "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "status": "enabled"
}
```

## Change Secret

Changing the user secret can be done by calling the update secret function

```bash
curl -sSiX PATCH http://localhost:9003/users/secret -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "old_secret": "<old_secret>",
  "new_secret": "<new_secret>"
}
EOF
```

For example:

```bash
curl -sSiX PATCH http://localhost:9003/users/secret -H "Content-Type: application/json" -H "Authorization: Bearer <user_token>" -d @- <<EOF
{
  "old_secret": "12345678",
  "new_secret": "123456789"
}
EOF

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 14:00:35 GMT
Content-Type: application/json
Content-Length: 281
Connection: keep-alive
Access-Control-Expose-Headers: Location
```

## Enable User

Changing the user status to enabled can be done by calling the enable user function

```bash
curl -sSiX GET http://localhost:9003/users/<user_id>/enable -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX POST http://localhost:9003/users/1890c034-7ef9-4cde-83df-d78ea1d4d281/enable -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 14:01:25 GMT
Content-Type: application/json
Content-Length: 382
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
  "name": "new name",
  "tags": ["manager", "developer"],
  "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "credentials": { "identity": "updated.john.doe@email.com", "secret": "" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-06-14T13:46:47.322648Z",
  "updated_at": "2023-06-14T13:59:53.422595Z",
  "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "status": "enabled"
}
```

## Disable User

Changing the user status to disabled can be done by calling the disable user function

```bash
curl -sSiX GET http://localhost:9003/users/<user_id>/disable -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX POST http://localhost:9003/users/1890c034-7ef9-4cde-83df-d78ea1d4d281/disable -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Wed, 14 Jun 2023 14:01:23 GMT
Content-Type: application/json
Content-Length: 383
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "id": "1890c034-7ef9-4cde-83df-d78ea1d4d281",
  "name": "new name",
  "tags": ["manager", "developer"],
  "owner": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "credentials": { "identity": "updated.john.doe@email.com", "secret": "" },
  "metadata": { "depertment": "confidential-computing" },
  "created_at": "2023-06-14T13:46:47.322648Z",
  "updated_at": "2023-06-14T13:59:53.422595Z",
  "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
  "status": "disabled"
}
```

## Get User Memberships

You can get all groups a user is assigned to by calling the get user memberships function.

If you want to paginate your results then use this `offset`, `limit`, `metadata`, `name`, `status`, `parentID`, `ownerID`, `tree` and `dir` query parameters.

> Must take into consideration the user identified by the `user_token` needs to be assigned to the same group with `c_list` action or is the owner of the user identified by the `user_id`.

```bash
curl -sSiX GET http://localhost:9003/users/<user_id>/memberships  -H "Authorization: Bearer <user_token>"
```

For example:

```bash
curl -sSiX GET http://localhost:9003/users/1890c034-7ef9-4cde-83df-d78ea1d4d281/memberships  -H "Authorization: Bearer <user_token>"

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Thu, 15 Jun 2023 11:22:18 GMT
Content-Type: application/json
Content-Length: 367
Connection: keep-alive
Access-Control-Expose-Headers: Location

{
  "limit": 0,
  "offset": 0,
  "memberships": [
    {
      "id": "2766ae94-9a08-4418-82ce-3b91cf2ccd3e",
      "owner_id": "94939159-d129-4f17-9e4e-cc2d615539d7",
      "name": "new name",
      "description": "new description",
      "metadata": { "depertment": "confidential-computing" },
      "created_at": "2023-06-15T09:41:42.860481Z",
      "updated_at": "2023-06-15T10:17:56.475241Z",
      "updated_by": "94939159-d129-4f17-9e4e-cc2d615539d7",
      "status": "enabled"
    }
  ]
}
```
