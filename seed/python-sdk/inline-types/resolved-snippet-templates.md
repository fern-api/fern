```python
from seed import RequestTypeInlineType1

client = SeedObject(base_url="https://yourhost.com/path/to/api", )        
client.get_root(
	bar=RequestTypeInlineType1(
		foo="foo"
	),
	foo="foo"
)

```


```python


client = SeedObject(base_url="https://yourhost.com/path/to/api", )        
client.get_discriminated_union(
	foo="foo"
)

```


```python


client = SeedObject(base_url="https://yourhost.com/path/to/api", )        
client.get_undiscriminated_union(
	foo="foo"
)

```


