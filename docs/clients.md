# Clients

## Issue Token
To issue access and refresh token to provide authorization header to API calls.

```bash
curl -X POST 'http://localhost:9002/users/tokens/issue' -H 'Content-Type: application/json' --data-raw '
{
    "identity": "<string>",
    "secret": "<string>"
}'
```

Example:

```bash
curl -X POST 'http://localhost:9002/users/tokens/issue' -H 'Content-Type: application/json' --data-raw '
{
    "identity": "admin@example.com",
    "secret": "12345678"
}'
```

Response:
```bash
{"access_token":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQ3NTM3ODAsImlhdCI6MTY4NDc1Mjg4MCwiaXNzIjoiY2xpZW50cy5hdXRoIiwicm9sZSI6IiIsInN1YiI6IjVjNjQ4MTg1LTU3NTMtNGVlOS1iYWI2LTkzMjc4ZDdiMDZiNCIsInRhZyI6IiIsInR5cGUiOiJhY2Nlc3MifQ.qLt0t_mTN3IWRaawj6S2IfWa62n4LaXK3-6JmrjbcKomWgkvKe34v3vmKyW45kPmCOC0h3FGUFXap-slfj3Hhw","refresh_token":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQ4MzkyODAsImlhdCI6MTY4NDc1Mjg4MCwiaXNzIjoiY2xpZW50cy5hdXRoIiwicm9sZSI6IiIsInN1YiI6IjVjNjQ4MTg1LTU3NTMtNGVlOS1iYWI2LTkzMjc4ZDdiMDZiNCIsInRhZyI6IiIsInR5cGUiOiJyZWZyZXNoIn0.nr1q4ECygWHBfTBSr2o3OMQJpbn3z0rzsEDCkkg3LRVTwf7r15o29fwcwbMvburvKbt5NBfV0BrXAn9TMb70RQ","access_type":"Bearer"}
```

The two tokens returned are:-

1. Access Token  
Use it for authorization, with the authorization header.  
Expires after 15 minutes (default).
```bash
-H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQ3NTM2ODUsImlhdCI6MTY4NDc1Mjc4NSwiaXNzIjoiY2xpZW50cy5hdXRoIiwicm9sZSI6IiIsInN1YiI6IjVjNjQ4MTg1LTU3NTMtNGVlOS1iYWI2LTkzMjc4ZDdiMDZiNCIsInRhZyI6IiIsInR5cGUiOiJhY2Nlc3MifQ.QFL2p6LHsXcp3kSQJTz3D3eNzv7nRFR7HMWNMg-LNHIUeK7k3nz6gvKRhC88SDTIoMxsL-2HWSVOotH6b9c6IQ"
```
2. Refresh Token  
Used to refresh the access token once it expires.  
Expires after 24 hours (default). After that you have to issue the tokens again using this same endpoint.  

## Refresh Token
Refresh the Access Token if/when it expires.  
Refresh token expires in 24 hours (default).

```bash
curl -X POST 'http://localhost:9002/users/tokens/refresh' -H 'Content-Type: application/json' -H"Authorization: Bearer <refresh_token>"
```

Example:

```bash
curl -X POST 'http://localhost:9002/users/tokens/refresh' -H 'Content-Type: application/json' -H"Authorization: Bearer $REFTOK"
```

Return a new access token, and a new refresh token.

Response:
```bash
{"access_token":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQ4MTY4MTksImlhdCI6MTY4NDc2MjgxOSwiaXNzIjoiY2xpZW50cy5hdXRoIiwicm9sZSI6IiIsInN1YiI6IjVjNjQ4MTg1LTU3NTMtNGVlOS1iYWI2LTkzMjc4ZDdiMDZiNCIsInRhZyI6IiIsInR5cGUiOiJhY2Nlc3MifQ.X3dX8-KKqs1qwFt6piXl6w_utqfHnYa5VB7wOQOf-u4xKbh7NFKEfkIF-j2XY_2C3pVLRgBOHIiiKhsix9PpNQ","refresh_token":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQ4NDkyMTksImlhdCI6MTY4NDc2MjgxOSwiaXNzIjoiY2xpZW50cy5hdXRoIiwicm9sZSI6IiIsInN1YiI6IjVjNjQ4MTg1LTU3NTMtNGVlOS1iYWI2LTkzMjc4ZDdiMDZiNCIsInRhZyI6IiIsInR5cGUiOiJyZWZyZXNoIn0.4SIxRD5CN1NBwl4dM7MD3Gd9jdaywY2kUwRgy4TBjNgpYqEyitqnUMsusYjQD-Z3Sub2bM7TDEw_So5XtJ7sWA","access_type":"Bearer"}
```

## Register Client / Create User
In order to create user, we need to provide username and password:

```bash
curl -sSi -X POST http://localhost:9002/users -H "Content-Type: application/json" -d @- <<EOF
{
    "credentials": {
        "identity": "<client_email>",
        "secret": "<client_password>"
    },
    "tags": [<tag_1>, <tag_2>, ..., <tag_n>]
}
EOF
```

Example:

```bash
curl -sSi -X POST http://localhost:9002/users -H "Content-Type: application/json" -d @- <<EOF
{
    "credentials": {
        "identity": "user@mail.com",
        "secret": "12345678"
    },
    "tags": ["a", "b"]
}
EOF
```

Response:

```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /clients/36c0f1e2-945e-4de1-bcdb-19935c9da449
Date: Mon, 22 May 2023 12:18:50 GMT
Content-Length: 225

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","tags":["a","b"],"credentials":{"identity":"user@mail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T12:18:50.887148Z","status":"enabled"}
```

## Retrieve a Client
Show a client if it's owned by you.

```bash
curl -sSi -X GET http://localhost:9002/users/<client_id> -H "Content-Type: application/json" -H "Authorization: Bearer <access_token>"
```

Example:

```bash
curl -sSi -X "GET http://localhost:9002/users/$CLIENT_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCTOK"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:09:56 GMT
Content-Length: 313

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","tags":["a","b"],"owner":"admin@example.com","credentials":{"identity":"user@mail.com","secret":"$2a$10$PckXb4XF5sPoOkGbmdvyvuIJXWNgZdfEQrn6cw4zeOhqfNLtitvjS"},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:04:44.438547Z","status":"enabled"}
```

## List Clients
List all the owned clients. Owner needs to register new clients with their issued access token, and they'll get listed here.

`Note: You can only clients owned by you. (Look into update client owner endpoint)`

```bash
curl -sSi -X GET http://localhost:9002/users -H "Content-Type: application/json" -H "Authorization: Bearer <access_token>"
```

Example:
```bash
curl -sSi -X GET http://localhost:9002/users -H "Content-Type: application/json" -H "Authorization: Bearer $ACCTOK"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Fri, 02 Jun 2023 11:47:49 GMT
Content-Length: 465

{"limit":10,"total":2,"users":[{"id":"c0dd6071-629c-4da9-bee4-96a93c7888a3","tags":["a","b"],"credentials":{"identity":"user@mail.com","secret":""},"created_at":"2023-06-02T11:47:27.563375Z","updated_at":"0001-01-01T00:00:00Z","status":"enabled"},{"id":"7b4ab9e3-6bcf-4ca3-b1a7-f9e01e580d85","tags":["c","d"],"credentials":{"identity":"user2@mail.com","secret":""},"created_at":"2023-06-02T11:47:42.24282Z","updated_at":"0001-01-01T00:00:00Z","status":"enabled"}]}
```

## Update Client Owner

```bash
curl -sSi -X PATCH http://localhost:9002/users/<client_id>r/owner -H "Content-Type: application/json" -H "Authorization: Bearer <access_token>" -d @- <<EOF
{
    "credentials": {
        "identity": "<client_email>",
        "secret": "<client_password>"
    },
    "owner": "<string>",
    "tags": [<tag_1>, <tag_2>, ..., <tag_n>]
}
EOF
```

Example:
```bash
curl -sSi -X PATCH http://localhost:9002/users/<client_id>r/owner -H "Content-Type: application/json" -H "Authorization: Bearer <access_token>" -d @- <<EOF
{
    "credentials": {
        "identity": "user@mail.com",
        "secret": "12345678"
    },
    "owner": "admin@example.com",
    "tags": ["a", "b"]
}
EOF
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:04:44 GMT
Content-Length: 253

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","tags":["a","b"],"owner":"admin@example.com","credentials":{"identity":"user@mail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:04:44.438547Z","status":"enabled"}
```

## Update Client Name and Metadata

```bash
curl -sSi -X PATCH http://localhost:9002/users/<client_id> -H "Content-Type: application/json" -H  "Authorization: Bearer <access_token>" -d '{"name": "new_name"}'
```

Example:
```bash
curl -sSi -X PATCH http://localhost:9002/users/<client_id> -H "Content-Type: application/json" -H  "Authorization: Bearer <access_token>" -d '
{
    "name": "new_name",
    "metadata": {"insert":"metadata"}
}'
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:48:32 GMT
Content-Length: 277

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"new_name","tags":["a","b"],"owner":"admin@example.com","credentials":{"identity":"user@mail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:48:32.215129Z","status":"enabled"}
```

## Update Client Tags

```bash
curl -sSi -X PATCH http://localhost:9002/users/<client_id>/tags -H "Content-Type: application/json" -H  "Authorization: Bearer <access_token>" -d '{"tags": ["new_tag_1", "new_tag_2"]}'
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:53:19 GMT
Content-Length: 293

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"user_new_name","tags":["new_tag_1","new_tag_2"],"owner":"admin@example.com","credentials":{"identity":"user@mail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:53:19.833693Z","status":"enabled"}
```

## Update Client Identity

```bash
curl -sSi -X PATCH http://localhost:9002/users/<client_id>/tags -H "Content-Type: application/json" -H  "Authorization: Bearer <access_token>" -d '{"identity": "<client_email>"}'
```

Example:
```bash
curl -sSi -X PATCH http://localhost:9002/users/$CLIENT_ID/tags -H "Content-Type: application/json" -H  "Authorization: Bearer $ACCTOK" -d '{"identity": "user_updated@email.com"}'
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:55:19 GMT
Content-Length: 260

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"user_new_name","owner":"admin@example.com","credentials":{"identity":"user@mail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:55:19.882616Z","status":"enabled"}
```

## Update Client Secret
```bash
curl -sSi -X PATCH http://localhost:9002/users/<client_id>/tags -H "Content-Type: application/json" -H  "Authorization: Bearer <access_token>" -d '{"secret": "<client_secret>"}'
```

```bash
curl -sSi -X PATCH http://localhost:9002/users/$CLIENT_ID/tags -H "Content-Type: application/json" -H  "Authorization: Bearer $ACCTOK" -d '{"secret": "87654321"}'
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:56:27 GMT
Content-Length: 260

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"user_new_name","owner":"admin@example.com","credentials":{"identity":"user@mail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:56:27.840129Z","status":"enabled"}
```

## Enable Client
Enable a Disabled Client.

```bash
curl -sSi -X POST http://localhost:9002/users/<client_id>/enable -H "Content-Type: application/json" -H  "Authorization: Bearer <access_token>"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 14:00:21 GMT
Content-Length: 260

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"user_new_name","owner":"admin@example.com","credentials":{"identity":"user@mail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:56:27.840129Z","status":"enabled"}
```

## Disable Client
Disable an Enabled Client.

```bash
curl -sSi -X POST http://localhost:9002/users/<client_id>/disable -H "Content-Type: application/json" -H  "Authorization: Bearer <access_token>"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:59:47 GMT
Content-Length: 261

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"user_new_name","owner":"admin@example.com","credentials":{"identity":"user@mail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:56:27.840129Z","status":"disabled"}
```

## List Client Members

```bash
curl -X GET "http://localhost:9002/users/<client_id>/memberships" -H 'Content-Type: application/json' -H  "Authorization: Bearer <access_token>"
```

Response:
```bash
{"total":0,"level":0,"name":"","memberships":[]}
```
