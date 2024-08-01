# Reference
<details><summary><code>client.<a href="src/seed/client.py">echo</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.echo(
    request="Hello world!\\n\\nwith\\n\\tnewlines",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Notification Service
<details><summary><code>client.file.notification.service.<a href="src/seed/file/notification/service/client.py">get_exception</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.file.notification.service.get_exception(
    notification_id="notification-hsy129x",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**notification_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Service
<details><summary><code>client.file.service.<a href="src/seed/file/service/client.py">get_file</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint returns a file by its name.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.file.service.get_file(
    filename="file.txt",
    x_file_api_version="0.0.2",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**filename:** `str` — This is a filename
    
</dd>
</dl>

<dl>
<dd>

**x_file_api_version:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Health Service
<details><summary><code>client.health.service.<a href="src/seed/health/service/client.py">check</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of a resource.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.health.service.check(
    id="id-3tey93i",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `str` — The id to check
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.health.service.<a href="src/seed/health/service/client.py">ping</a>()</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of the service.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.health.service.ping()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.service.<a href="src/seed/service/client.py">get_movie</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.service.get_movie(
    movie_id="movie-c06a4ad7",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**movie_id:** `MovieId` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="src/seed/service/client.py">create_movie</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.service.create_movie(
    id="movie-c06a4ad7",
    prequel="movie-cv9b914f",
    title="The Boy and the Heron",
    from_="Hayao Miyazaki",
    rating=8.0,
    tag="tag-wf9as23d",
    metadata={
        "actors": ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
        "releaseDate": "2023-12-08",
        "ratings": {"rottenTomatoes": 97, "imdb": 7.6},
    },
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `MovieId` 
    
</dd>
</dl>

<dl>
<dd>

**title:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**from_:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**rating:** `float` — The rating scale is one to five stars
    
</dd>
</dl>

<dl>
<dd>

**tag:** `Tag` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `typing.Dict[str, typing.Any]` 
    
</dd>
</dl>

<dl>
<dd>

**prequel:** `typing.Optional[MovieId]` 
    
</dd>
</dl>

<dl>
<dd>

**book:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="src/seed/service/client.py">get_metadata</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.service.get_metadata(
    x_api_version="0.0.1",
    shallow=False,
    tag="development",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**x_api_version:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**shallow:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**tag:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="src/seed/service/client.py">get_response</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExamples
from seed.environment import SeedExamplesEnvironment

client = SeedExamples(
    token="YOUR_TOKEN",
    environment=SeedExamplesEnvironment.PRODUCTION,
)
client.service.get_response()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

