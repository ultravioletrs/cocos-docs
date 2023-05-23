# Policies
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