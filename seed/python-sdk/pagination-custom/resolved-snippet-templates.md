```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.users.list_usernames_custom(
	starting_after="starting_after"
)

```


