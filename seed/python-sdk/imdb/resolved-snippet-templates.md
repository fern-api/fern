```python
from seed import SeedApi

client = SeedApi(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.imdb.create_movie(
	title="title",
	rating=1.1
)

```


```python
from seed import SeedApi

client = SeedApi(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.imdb.get_movie(
	movie_id="movieId"
)

```


