```python


client = SeedMixedCase(base_url="https://yourhost.com/path/to/api", )        
client.service.get_resource(
	resource_id="rsc-xyz"
)

```


```python


client = SeedMixedCase(base_url="https://yourhost.com/path/to/api", )        
client.service.get_resource(
	resource_id="ResourceID"
)

```


```python


client = SeedMixedCase(base_url="https://yourhost.com/path/to/api", )        
client.service.list_resources(
	page_limit=10,
	before_date="2023-01-01"
)

```


```python


client = SeedMixedCase(base_url="https://yourhost.com/path/to/api", )        
client.service.list_resources(
	page_limit=1,
	before_date="2023-01-15"
)

```


