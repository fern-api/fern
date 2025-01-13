```python
from seed import Column

client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
client.dataservice.upload(
	columns=[
		Column(
			id="id"
		)
	]
)

```


```python
from seed import Column

client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
client.dataservice.upload(
	columns=[
		Column(
			id="id"
		),
		Column(
			id="id"
		)
	],
	namespace="namespace"
)

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
undefined

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
client.dataservice.delete(
	ids=[
		"ids",
		"ids"
	],
	delete_all=true,
	namespace="namespace"
)

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
undefined

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
undefined

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
undefined

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
client.dataservice.fetch(
	ids="ids",
	namespace="namespace"
)

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
undefined

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
client.dataservice.list(
	prefix="prefix",
	limit=1,
	pagination_token="paginationToken",
	namespace="namespace"
)

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
client.dataservice.query(
	top_k=1
)

```


```python
from seed import QueryColumn
from seed import IndexedData

client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
client.dataservice.query(
	namespace="namespace",
	top_k=1,
	include_values=true,
	include_metadata=true,
	queries=[
		QueryColumn(
			top_k=1,
			namespace="namespace",
			indexed_data=IndexedData(
				indices=[
					1,
					1
				],
				values=[
					1.1,
					1.1
				]
			)
		),
		QueryColumn(
			top_k=1,
			namespace="namespace",
			indexed_data=IndexedData(
				indices=[
					1,
					1
				],
				values=[
					1.1,
					1.1
				]
			)
		)
	],
	column=[
		1.1,
		1.1
	],
	id="id",
	indexed_data=IndexedData(
		indices=[
			1,
			1
		],
		values=[
			1.1,
			1.1
		]
	)
)

```


```python


client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
client.dataservice.update(
	id="id"
)

```


```python
from seed import IndexedData

client = SeedApi(base_url="https://yourhost.com/path/to/api", )        
client.dataservice.update(
	id="id",
	values=[
		1.1,
		1.1
	],
	namespace="namespace",
	indexed_data=IndexedData(
		indices=[
			1,
			1
		],
		values=[
			1.1,
			1.1
		]
	)
)

```


