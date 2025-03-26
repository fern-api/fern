```python


client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.bigunion.get(
	id="id"
)

```


```python
from seed.bigunion import BigUnion_NormalSweet

client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.bigunion.update(
	request=request=BigUnion_NormalSweet(value="value", )
)

```


```python
from seed.bigunion import BigUnion_NormalSweet

client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.bigunion.update_many(
	request=[
		BigUnion_NormalSweet(value="value", ),
		BigUnion_NormalSweet(value="value", )
	]
)

```


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


