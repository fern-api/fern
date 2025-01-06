```python
from seed import SeedBasicAuthEnvironmentVariables

client = SeedBasicAuthEnvironmentVariables(base_url="https://yourhost.com/path/to/api", username="YOUR_USERNAME",password="YOUR_PASSWORD", )        
client.basic_auth.get_with_basic_auth(
	
)

```


```python
from seed import SeedBasicAuthEnvironmentVariables

client = SeedBasicAuthEnvironmentVariables(base_url="https://yourhost.com/path/to/api", username="YOUR_USERNAME",password="YOUR_PASSWORD", )        
client.basic_auth.post_with_basic_auth(
	request={"key":"value"}
)

```


