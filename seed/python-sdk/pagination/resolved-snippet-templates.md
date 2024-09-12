```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.users.list_with_cursor_pagination(
	page=1,
	per_page=1,
	starting_after="string"
)
 
```                        


```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.users.list_with_offset_pagination(
	page=1,
	per_page=1,
	starting_after="string"
)
 
```                        


```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.users.list_with_offset_step_pagination(
	page=1,
	limit=1
)
 
```                        


```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.users.list_with_offset_pagination_has_next_page(
	page=1,
	limit=1
)
 
```                        


```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.users.list_with_extended_results(
	cursor="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
)
 
```                        


```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.users.list_with_extended_results_and_optional_data(
	cursor="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
)
 
```                        


```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.users.list_usernames(
	starting_after="string"
)
 
```                        


```python
from seed import SeedPagination

client = SeedPagination(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.users.list_with_global_config(
	offset=1
)
 
```                        


