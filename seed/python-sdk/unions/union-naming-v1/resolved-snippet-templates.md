```python


client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.union.get(
	id="id"
)

```


```python
from seed.union import CircleShape

client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.union.update(
	request=request=CircleShape(radius=1.1, )
)

```


