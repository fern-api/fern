```python


client = SeedOauthClientCredentials(base_url="https://yourhost.com/path/to/api", client_id="YOUR_CLIENT_ID", client_secret="YOUR_CLIENT_SECRET", )        
client.auth.get_token_with_client_credentials(
	client_id="client_id",
	client_secret="client_secret",
	scope="scope"
)

```


```python


client = SeedOauthClientCredentials(base_url="https://yourhost.com/path/to/api", client_id="YOUR_CLIENT_ID", client_secret="YOUR_CLIENT_SECRET", )        
client.auth.refresh_token(
	client_id="client_id",
	client_secret="client_secret",
	refresh_token="refresh_token",
	scope="scope"
)

```


