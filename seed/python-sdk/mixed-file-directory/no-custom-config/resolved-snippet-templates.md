```python


client = SeedMixedFileDirectory(base_url="https://yourhost.com/path/to/api", )        
client.organization.create(
	name="name"
)

```


```python


client = SeedMixedFileDirectory(base_url="https://yourhost.com/path/to/api", )        
client.user.list(
	limit=1
)

```


```python


client = SeedMixedFileDirectory(base_url="https://yourhost.com/path/to/api", )        
client.user.events.list_events(
	limit=1
)

```


```python


client = SeedMixedFileDirectory(base_url="https://yourhost.com/path/to/api", )        
client.user.events.metadata.get_metadata(
	id="id"
)

```


