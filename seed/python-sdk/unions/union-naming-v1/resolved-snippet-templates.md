```python


client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.bigunion.get(
	id="id"
)

```


```python
from seed.bigunion import NormalSweetBigUnion

client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.bigunion.update(
	request=request=NormalSweetBigUnion(value="value", )
)

```


```python
from seed.bigunion import NormalSweetBigUnion

client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.bigunion.update_many(
	request=[
		NormalSweetBigUnion(value="value", ),
		NormalSweetBigUnion(value="value", )
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
from seed.union import CircleShape

client = SeedUnions(base_url="https://yourhost.com/path/to/api", )        
client.union.update(
	request=request=CircleShape(radius=1.1, )
)

```


