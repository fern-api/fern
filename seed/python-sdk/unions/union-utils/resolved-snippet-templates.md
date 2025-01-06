```python


client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.union.get(
	id="id"
)

```


```python
from seed.union import Shape_Circle

client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.union.update(
	request=request=Shape_Circle(radius=1.1, )
)

```


