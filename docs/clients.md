# Clients
<br></br>

## <ins>Issue Token</ins>
To issue access and refresh token to provide authorization header to API calls.

```bash
curl -X POST 'http://localhost:9191/clients/tokens/issue' -H 'Content-Type: application/json' --data-raw '
{
    "identity": "admin@example.com",
    "secret": "12345678"
}'
```

Returns:
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

<br></br>

## <ins>Refresh Token</ins>
Refresh the Access Token if/when it expires.  
Refresh token expires in 24 hours (default).

```bash
curl -X POST 'http://localhost:9191/clients/tokens/refresh' -H 'Content-Type: application/json' -H"Authorization: Bearer $REFTOK"
```

Return a new access token, and a new refresh token.

Response:
```bash
{"access_token":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQ4MTY4MTksImlhdCI6MTY4NDc2MjgxOSwiaXNzIjoiY2xpZW50cy5hdXRoIiwicm9sZSI6IiIsInN1YiI6IjVjNjQ4MTg1LTU3NTMtNGVlOS1iYWI2LTkzMjc4ZDdiMDZiNCIsInRhZyI6IiIsInR5cGUiOiJhY2Nlc3MifQ.X3dX8-KKqs1qwFt6piXl6w_utqfHnYa5VB7wOQOf-u4xKbh7NFKEfkIF-j2XY_2C3pVLRgBOHIiiKhsix9PpNQ","refresh_token":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQ4NDkyMTksImlhdCI6MTY4NDc2MjgxOSwiaXNzIjoiY2xpZW50cy5hdXRoIiwicm9sZSI6IiIsInN1YiI6IjVjNjQ4MTg1LTU3NTMtNGVlOS1iYWI2LTkzMjc4ZDdiMDZiNCIsInRhZyI6IiIsInR5cGUiOiJyZWZyZXNoIn0.4SIxRD5CN1NBwl4dM7MD3Gd9jdaywY2kUwRgy4TBjNgpYqEyitqnUMsusYjQD-Z3Sub2bM7TDEw_So5XtJ7sWA","access_type":"Bearer"}
```

<br></br>

## <ins>Register Client / Create User</ins>
In order to create user, we need to provide username and password:

```bash
curl -sSi -X POST http://localhost:9191/clients -H "Content-Type: application/json" -d @- <<EOF
{
    "credentials": {
        "identity": "<client_email>",
        "secret": "<client_password>"
    },
    "tags": ["a", "b"]
}
EOF
```

Returns:
```bash
HTTP/1.1 201 Created
Content-Type: application/json
Location: /clients/36c0f1e2-945e-4de1-bcdb-19935c9da449
Date: Mon, 22 May 2023 12:18:50 GMT
Content-Length: 225

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","tags":["a","b"],"credentials":{"identity":"aryan@gmail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T12:18:50.887148Z","status":"enabled"}
```

<br></br>

## <ins>List Client</ins>
Show a client if it's owned by you.
```bash
curl -sSi -X GET http://localhost:9191/clients/$CLIENT_ID -H "Content-Type: application/json" -H "Authorization: Bearer $REFTOK"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:09:56 GMT
Content-Length: 313

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","tags":["a","b"],"owner":"admin@example.com","credentials":{"identity":"aryan@gmail.com","secret":"$2a$10$PckXb4XF5sPoOkGbmdvyvuIJXWNgZdfEQrn6cw4zeOhqfNLtitvjS"},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:04:44.438547Z","status":"enabled"}
```

<br></br>

## <ins>List Clients</ins>
List all the owned clients.  

```
Note: You can only clients owned by you. (Look into update client owner endpoint)
```  

```bash
curl -sSi -X GET http://localhost:9191/clients -H "Content-Type: application/json" -H "Authorization: Bearer $ACCTOK"
```

<br></br>

## <ins>Update Client Owner</ins>
Update the owner of a client.

```bash
curl -sSi -X PATCH http://localhost:9191/clients/36c0f1e2-945e-4de1-bcdb-19935c9da449/owner -H "Content-Type: application/json" -H "Authorization: Bearer $ACCTOK" -d @- <<EOF
{
    "credentials": {
        "identity": "aryan@gmail.com",
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

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","tags":["a","b"],"owner":"admin@example.com","credentials":{"identity":"aryan@gmail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:04:44.438547Z","status":"enabled"}
```

<br></br>

## <ins>Update Client Name and Metadata</ins>
Update the Client's Name and/or Metadata.
```bash
curl -sSi -X PATCH http://localhost:9191/clients/$CLIENT_ID -H "Content-Type: application/json" -H  "Authorization: Bearer $ACCTOK" -d '{"name": "aryan_new_name"}'
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:48:32 GMT
Content-Length: 277

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"aryan_new_name","tags":["a","b"],"owner":"admin@example.com","credentials":{"identity":"aryan@gmail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:48:32.215129Z","status":"enabled"}
```

<br></br>

## <ins>Update Client Tags</ins>
Update the Client's Tags.
```bash
curl -sSi -X PATCH http://localhost:9191/clients/$CLIENT_ID/tags -H "Content-Type: application/json" -H  "Authorization: Bearer $ACCTOK" -d '{"tags": ["new_tag_1", "new_tag_2"]}'
```

Response:
```curl
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:53:19 GMT
Content-Length: 293

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"aryan_new_name","tags":["new_tag_1","new_tag_2"],"owner":"admin@example.com","credentials":{"identity":"aryan@gmail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:53:19.833693Z","status":"enabled"}
```

<br></br>

## <ins>Update Client Identity</ins>
Update Client's Identity.
```bash
curl -sSi -X PATCH http://localhost:9191/clients/$CLIENT_ID/tags -H "Content-Type: application/json" -H  "Authorization: Bearer $ACCTOK" -d '{"identity": "aryan_updated@email.com"}'
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:55:19 GMT
Content-Length: 260

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"aryan_new_name","owner":"admin@example.com","credentials":{"identity":"aryan@gmail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:55:19.882616Z","status":"enabled"}
```

<br></br>

## <ins>Update Client Secret</ins>
Update the Client's Secret.
curl -sSi -X PATCH http://localhost:9191/clients/$CLIENT_ID/tags -H "Content-Type: application/json" -H  "Authorization: Bearer $ACCTOK" -d '{"secret": "87654321"}'

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:56:27 GMT
Content-Length: 260

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"aryan_new_name","owner":"admin@example.com","credentials":{"identity":"aryan@gmail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:56:27.840129Z","status":"enabled"}
```

<br></br>

## <ins>Enable Client</ins>
Enable a Disabled Client.

```bash
curl -sSi -X POST http://localhost:9191/clients/$CLIENT_ID/enable -H "Content-Type: application/json" -H  "Authorization: Bearer $ACCTOK"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 14:00:21 GMT
Content-Length: 260

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"aryan_new_name","owner":"admin@example.com","credentials":{"identity":"aryan@gmail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:56:27.840129Z","status":"enabled"}
```

<br></br>

## <ins>Disable Client</ins>
Disable an Enabled Client.

```bash
curl -sSi -X POST http://localhost:9191/clients/$CLIENT_ID/disable -H "Content-Type: application/json" -H  "Authorization: Bearer $ACCTOK"
```

Response:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
Date: Mon, 22 May 2023 13:59:47 GMT
Content-Length: 261

{"id":"36c0f1e2-945e-4de1-bcdb-19935c9da449","name":"aryan_new_name","owner":"admin@example.com","credentials":{"identity":"aryan@gmail.com","secret":""},"created_at":"2023-05-22T12:18:50.887148Z","updated_at":"2023-05-22T13:56:27.840129Z","status":"disabled"}
```

<br></br> 

## <ins>List Client Members</ins>
List Group Members.

```bash

```

Response:
```bash
```

<br></br>
