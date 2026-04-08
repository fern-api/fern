# Reference
<details><summary><code>client.<a href="src/seed/client.py">echo</a>(...) -> str</code></summary>
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
    token="<token>",
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

<details><summary><code>client.<a href="src/seed/client.py">create_type</a>(...) -> Identifier</code></summary>
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
    token="<token>",
    environment=SeedExamplesEnvironment.PRODUCTION,
)

client.echo(
    request="primitive",
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

**request:** `Type` 
    
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
<details><summary><code>client.file.notification.service.<a href="src/seed/file/notification/service/client.py">get_exception</a>(...) -> Exception</code></summary>
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
    token="<token>",
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
<details><summary><code>client.file.service.<a href="src/seed/file/service/client.py">get_file</a>(...) -> File</code></summary>
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
    token="<token>",
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
    token="<token>",
    environment=SeedExamplesEnvironment.PRODUCTION,
)

client.health.service.check(
    id="id-2sdx82h",
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

<details><summary><code>client.health.service.<a href="src/seed/health/service/client.py">ping</a>() -> bool</code></summary>
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
    token="<token>",
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
<details><summary><code>client.service.<a href="src/seed/service/client.py">get_movie</a>(...) -> Movie</code></summary>
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
    token="<token>",
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">create_movie</a>(...) -> MovieId</code></summary>
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
    token="<token>",
    environment=SeedExamplesEnvironment.PRODUCTION,
)

client.service.create_movie(
    id="movie-c06a4ad7",
    prequel="movie-cv9b914f",
    title="The Boy and the Heron",
    from_="Hayao Miyazaki",
    rating=8,
    tag="tag-wf9as23d",
    metadata={
        "actors": ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
        "releaseDate": "2023-12-08",
        "ratings": {"rottenTomatoes": 97, "imdb": 7.6}
    },
    revenue=1000000,
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

**request:** `Movie` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">get_metadata</a>(...) -> Metadata</code></summary>
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
    token="<token>",
    environment=SeedExamplesEnvironment.PRODUCTION,
)

client.service.get_metadata(
    shallow=False,
    tag=[
        "development"
    ],
    x_api_version="0.0.1",
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">create_big_entity</a>(...) -> Response</code></summary>
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
from seed.types import Actor, ExtendedMovie, Entity, Metadata_Html, Migration, Exception_Generic, Test_And, Node, Tree, Directory, File, Moment
from seed.commons.types import Metadata, EventInfo_Metadata, Data_String
import uuid
import datetime

client = SeedExamples(
    token="<token>",
    environment=SeedExamplesEnvironment.PRODUCTION,
)

client.service.create_big_entity(
    cast_member=Actor(
        name="name",
        id="id",
    ),
    extended_movie=ExtendedMovie(
        cast=[
            "cast",
            "cast"
        ],
        id="id",
        prequel="prequel",
        title="title",
        from_="from",
        rating=1.1,
        type="movie",
        tag="tag",
        book="book",
        metadata={
            "metadata": {"key": "value"}
        },
        revenue=1000000,
    ),
    entity=Entity(
        type="primitive",
        name="name",
    ),
    metadata=Metadata_Html(
        extra={
            "extra": "extra"
        },
        tags=[
            "tags"
        ],
        html=,
    ),
    common_metadata=Metadata(
        id="id",
        data={
            "data": "data"
        },
        json_string="jsonString",
    ),
    event_info=EventInfo_Metadata(
        id="id",
        data={
            "data": "data"
        },
        json_string="jsonString",
    ),
    data=Data_String(
        string=,
    ),
    migration=Migration(
        name="name",
        status="RUNNING",
    ),
    exception=Exception_Generic(
        exception_type="exceptionType",
        exception_message="exceptionMessage",
        exception_stacktrace="exceptionStacktrace",
    ),
    test=Test_And(
        and_=,
    ),
    node=Node(
        name="name",
        nodes=[
            Node(
                name="name",
                nodes=[
                    Node(
                        name="name",
                    ),
                    Node(
                        name="name",
                    )
                ],
                trees=[
                    Tree(
                        nodes=[],
                    ),
                    Tree(
                        nodes=[],
                    )
                ],
            ),
            Node(
                name="name",
                nodes=[
                    Node(
                        name="name",
                    ),
                    Node(
                        name="name",
                    )
                ],
                trees=[
                    Tree(
                        nodes=[],
                    ),
                    Tree(
                        nodes=[],
                    )
                ],
            )
        ],
        trees=[
            Tree(
                nodes=[
                    Node(
                        name="name",
                        nodes=[],
                        trees=[],
                    ),
                    Node(
                        name="name",
                        nodes=[],
                        trees=[],
                    )
                ],
            ),
            Tree(
                nodes=[
                    Node(
                        name="name",
                        nodes=[],
                        trees=[],
                    ),
                    Node(
                        name="name",
                        nodes=[],
                        trees=[],
                    )
                ],
            )
        ],
    ),
    directory=Directory(
        name="name",
        files=[
            File(
                name="name",
                contents="contents",
            ),
            File(
                name="name",
                contents="contents",
            )
        ],
        directories=[
            Directory(
                name="name",
                files=[
                    File(
                        name="name",
                        contents="contents",
                    ),
                    File(
                        name="name",
                        contents="contents",
                    )
                ],
                directories=[
                    Directory(
                        name="name",
                    ),
                    Directory(
                        name="name",
                    )
                ],
            ),
            Directory(
                name="name",
                files=[
                    File(
                        name="name",
                        contents="contents",
                    ),
                    File(
                        name="name",
                        contents="contents",
                    )
                ],
                directories=[
                    Directory(
                        name="name",
                    ),
                    Directory(
                        name="name",
                    )
                ],
            )
        ],
    ),
    moment=Moment(
        id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        date=datetime.date.fromisoformat("2023-01-15"),
        datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    ),
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

**request:** `BigEntity` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">refresh_token</a>(...)</code></summary>
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
    token="<token>",
    environment=SeedExamplesEnvironment.PRODUCTION,
)

client.service.refresh_token()

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

**request:** `typing.Optional[RefreshTokenRequest]` 
    
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

