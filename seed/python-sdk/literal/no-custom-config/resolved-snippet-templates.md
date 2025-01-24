```python


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.headers.send(
	query="What is the weather today"
)

```


```python


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.headers.send(
	query="query"
)

```


```python
from seed.inlined import ATopLevelLiteral

client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.inlined.send(
	query="What is the weather today",
	temperature=10.1,
	object_with_literal=ATopLevelLiteral(
		nested_literal=ANestedLiteral(
			
		)
	)
)

```


```python
from seed.inlined import ATopLevelLiteral

client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.inlined.send(
	query="query",
	temperature=1.1,
	object_with_literal=ATopLevelLiteral(
		nested_literal=ANestedLiteral(
			
		)
	)
)

```


```python


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.path.send(
	
)

```


```python


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.path.send(
	
)

```


```python


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.query.send(
	query="What is the weather today"
)

```


```python


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.query.send(
	query="query"
)

```


```python
from seed.reference import ContainerObject
from seed.reference import NestedObjectWithLiterals

client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.reference.send(
	query="What is the weather today",
	container_object=ContainerObject(
		nested_objects=[
			NestedObjectWithLiterals(
				str_prop="strProp"
			)
		]
	)
)

```


```python
from seed.reference import ContainerObject
from seed.reference import NestedObjectWithLiterals

client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.reference.send(
	query="query",
	container_object=ContainerObject(
		nested_objects=[
			NestedObjectWithLiterals(
				str_prop="strProp"
			),
			NestedObjectWithLiterals(
				str_prop="strProp"
			)
		]
	)
)

```


