# Reference
## _
<details><summary><code>client._.<a href="src/seed/_/client.py">echo</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client._.echo(
    request="string",
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

<details><summary><code>client._.<a href="src/seed/_/client.py">create_type</a>(...) -> Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client._.create_type(
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

## FileNotificationService
<details><summary><code>client.file_notification_service.<a href="src/seed/file_notification_service/client.py">file_notification_service_get_exception</a>(...) -> Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client.file_notification_service.file_notification_service_get_exception(
    notification_id="notificationId",
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

## FileService
<details><summary><code>client.file_service.<a href="src/seed/file_service/client.py">file_service_get_file</a>(...) -> File</code></summary>
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
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client.file_service.file_service_get_file(
    filename="filename",
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

## HealthService
<details><summary><code>client.health_service.<a href="src/seed/health_service/client.py">health_service_check</a>(...)</code></summary>
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
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client.health_service.health_service_check(
    id="id",
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

<details><summary><code>client.health_service.<a href="src/seed/health_service/client.py">health_service_ping</a>() -> bool</code></summary>
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
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client.health_service.health_service_ping()

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
<details><summary><code>client.service.<a href="src/seed/service/client.py">getmovie</a>(...) -> Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client.service.getmovie(
    movie_id="movieId",
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">createmovie</a>(...) -> MovieId</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client.service.createmovie(
    id="id",
    title="title",
    from_="from",
    rating=1.1,
    type="movie",
    tag="tag",
    metadata={
        "key": "value"
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">getmetadata</a>(...) -> Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client.service.getmetadata(
    api_version="X-API-Version",
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

**api_version:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**shallow:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**tag:** `typing.Optional[typing.Union[typing.Optional[str], typing.Sequence[typing.Optional[str]]]]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">createbigentity</a>(...) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client.service.createbigentity()

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

**cast_member:** `typing.Optional[CastMember]` 
    
</dd>
</dl>

<dl>
<dd>

**extended_movie:** `typing.Optional[ExtendedMovie]` 
    
</dd>
</dl>

<dl>
<dd>

**entity:** `typing.Optional[Entity]` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `typing.Optional[Metadata]` 
    
</dd>
</dl>

<dl>
<dd>

**common_metadata:** `typing.Optional[CommonsMetadata]` 
    
</dd>
</dl>

<dl>
<dd>

**event_info:** `typing.Optional[CommonsEventInfo]` 
    
</dd>
</dl>

<dl>
<dd>

**data:** `typing.Optional[CommonsData]` 
    
</dd>
</dl>

<dl>
<dd>

**migration:** `typing.Optional[Migration]` 
    
</dd>
</dl>

<dl>
<dd>

**exception:** `typing.Optional[Exception]` 
    
</dd>
</dl>

<dl>
<dd>

**test:** `typing.Optional[Test]` 
    
</dd>
</dl>

<dl>
<dd>

**node:** `typing.Optional[Node]` 
    
</dd>
</dl>

<dl>
<dd>

**directory:** `typing.Optional[Directory]` 
    
</dd>
</dl>

<dl>
<dd>

**moment:** `typing.Optional[Moment]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">refreshtoken</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.environment import SeedExhaustiveEnvironment

client = SeedExhaustive(
    token="<token>",
    environment=SeedExhaustiveEnvironment.PRODUCTION,
)

client.service.refreshtoken(
    ttl=1,
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

**ttl:** `int` 
    
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

