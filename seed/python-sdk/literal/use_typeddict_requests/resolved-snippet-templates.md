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


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.inlined.send(
	query="What is the weather today",
	temperature=10.1,
	object_with_literal={
		"nested_literal": {
			
		}
	}
)

```


```python


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.inlined.send(
	query="query",
	temperature=1.1,
	object_with_literal={
		"nested_literal": {
			
		}
	}
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


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.reference.send(
	query="What is the weather today",
	container_object={
		"nested_objects": [
			{
				"str_prop": "strProp"
			}
		]
	}
)

```


```python


client = SeedLiteral(base_url="https://yourhost.com/path/to/api", )        
client.reference.send(
	query="query",
	container_object={
		"nested_objects": [
			{
				"str_prop": "strProp"
			},
			{
				"str_prop": "strProp"
			}
		]
	}
)

```


