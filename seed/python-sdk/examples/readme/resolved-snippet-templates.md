```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.echo(
	request="Hello world!\\n\\nwith\\n\\tnewlines"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.echo(
	request="string"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
undefined

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.file.notification.service.get_exception(
	
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.file.notification.service.get_exception(
	
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.file.service.get_file(
	filename="file.txt"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.file.service.get_file(
	filename="filename"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.health.service.check(
	id="id-2sdx82h"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.health.service.check(
	id="id-3tey93i"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.health.service.check(
	id="id"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.health.service.ping(
	
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.health.service.ping(
	
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.service.get_movie(
	movie_id="movie-c06a4ad7"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.service.get_movie(
	movie_id="movieId"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.service.create_movie(
	id="movie-c06a4ad7",
	prequel="movie-cv9b914f",
	title="The Boy and the Heron",
	from_="Hayao Miyazaki",
	rating=8,
	tag="tag-wf9as23d",
	metadata={
		"actors": ["Christian Bale","Florence Pugh","Willem Dafoe"],
		"releaseDate": "2023-12-08",
		"ratings": {"rottenTomatoes":97,"imdb":7.6}
	},
	revenue=1000000
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.service.create_movie(
	id="id",
	prequel="prequel",
	title="title",
	from_="from",
	rating=1.1,
	tag="tag",
	book="book",
	metadata={
		"metadata": {"key":"value"}
	},
	revenue=1000000
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.service.get_metadata(
	x_api_version="0.0.1",
	shallow=false,
	tag="development"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.service.get_metadata(
	x_api_version="X-API-Version",
	shallow=true,
	tag="tag"
)

```


```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment
from seed.types import ExtendedMovie
from seed.types import Entity
from seed.commons.types import Metadata
from seed.types import Migration
from seed.types import Node
from seed.types import Directory
from seed.types import File
from seed.types import Moment

client = SeedExamples(environment=SeedExamplesEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.service.create_big_entity(
	extended_movie=ExtendedMovie(
		cast=[
			"cast",
			"cast"
		]
	),
	entity=Entity(
		name="name"
	),
	common_metadata=Metadata(
		id="id",
		data={
			"data": "data"
		},
		json_string="jsonString"
	),
	migration=Migration(
		name="name"
	),
	node=Node(
		name="name",
		nodes=[
			Node(
				name="name"
			),
			Node(
				name="name"
			)
		],
		trees=[
			
		]
	),
	directory=Directory(
		name="name",
		files=[
			File(
				name="name",
				contents="contents"
			),
			File(
				name="name",
				contents="contents"
			)
		],
		directories=[
			Directory(
				name="name"
			),
			Directory(
				name="name"
			)
		]
	),
	moment=Moment(
		id="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
		date="2023-01-15",
		datetime="2024-01-15T09:30:00Z"
	)
)

```


