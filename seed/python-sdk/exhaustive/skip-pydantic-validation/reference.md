# Reference
## Endpoints Container
<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_list_of_primitives</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.container.get_and_return_list_of_primitives(
    request=["string", "string"],
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

**request:** `typing.Sequence[str]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_list_of_objects</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithRequiredField

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.container.get_and_return_list_of_objects(
    request=[
        ObjectWithRequiredField(
            string="string",
        ),
        ObjectWithRequiredField(
            string="string",
        ),
    ],
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

**request:** `typing.Sequence[ObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_set_of_primitives</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.container.get_and_return_set_of_primitives(
    request={"string"},
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

**request:** `typing.Set[str]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_set_of_objects</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithRequiredField

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.container.get_and_return_set_of_objects(
    request=[
        ObjectWithRequiredField(
            string="string",
        )
    ],
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

**request:** `typing.Sequence[ObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_map_prim_to_prim</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.container.get_and_return_map_prim_to_prim(
    request={"string": "string"},
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

**request:** `typing.Dict[str, str]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_map_of_prim_to_object</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithRequiredField

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.container.get_and_return_map_of_prim_to_object(
    request={
        "string": ObjectWithRequiredField(
            string="string",
        )
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

**request:** `typing.Dict[str, ObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_optional</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithRequiredField

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.container.get_and_return_optional(
    request=ObjectWithRequiredField(
        string="string",
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

**request:** `typing.Optional[ObjectWithRequiredField]` 
    
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

## Endpoints ContentType
<details><summary><code>client.endpoints.content_type.<a href="src/seed/endpoints/content_type/client.py">post_json_patch_content_type</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime
import uuid

from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.content_type.post_json_patch_content_type(
    string="string",
    integer=1,
    long_=1000000,
    double=1.1,
    bool_=True,
    datetime=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    date=datetime.date.fromisoformat(
        "2023-01-15",
    ),
    uuid_=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    base_64="SGVsbG8gd29ybGQh",
    list_=["list", "list"],
    set_={"set"},
    map_={1: "map"},
    bigint=1000000,
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

**string:** `typing.Optional[str]` — This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    
</dd>
</dl>

<dl>
<dd>

**integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**long_:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**double:** `typing.Optional[float]` 
    
</dd>
</dl>

<dl>
<dd>

**bool_:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `typing.Optional[dt.datetime]` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `typing.Optional[dt.date]` 
    
</dd>
</dl>

<dl>
<dd>

**uuid_:** `typing.Optional[uuid.UUID]` 
    
</dd>
</dl>

<dl>
<dd>

**base_64:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**list_:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**set_:** `typing.Optional[typing.Set[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**map_:** `typing.Optional[typing.Dict[int, str]]` 
    
</dd>
</dl>

<dl>
<dd>

**bigint:** `typing.Optional[str]` 
    
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

<details><summary><code>client.endpoints.content_type.<a href="src/seed/endpoints/content_type/client.py">post_json_patch_content_with_charset_type</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime
import uuid

from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.content_type.post_json_patch_content_with_charset_type(
    string="string",
    integer=1,
    long_=1000000,
    double=1.1,
    bool_=True,
    datetime=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    date=datetime.date.fromisoformat(
        "2023-01-15",
    ),
    uuid_=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    base_64="SGVsbG8gd29ybGQh",
    list_=["list", "list"],
    set_={"set"},
    map_={1: "map"},
    bigint=1000000,
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

**string:** `typing.Optional[str]` — This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    
</dd>
</dl>

<dl>
<dd>

**integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**long_:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**double:** `typing.Optional[float]` 
    
</dd>
</dl>

<dl>
<dd>

**bool_:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `typing.Optional[dt.datetime]` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `typing.Optional[dt.date]` 
    
</dd>
</dl>

<dl>
<dd>

**uuid_:** `typing.Optional[uuid.UUID]` 
    
</dd>
</dl>

<dl>
<dd>

**base_64:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**list_:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**set_:** `typing.Optional[typing.Set[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**map_:** `typing.Optional[typing.Dict[int, str]]` 
    
</dd>
</dl>

<dl>
<dd>

**bigint:** `typing.Optional[str]` 
    
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

## Endpoints Enum
<details><summary><code>client.endpoints.enum.<a href="src/seed/endpoints/enum/client.py">get_and_return_enum</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.enum.get_and_return_enum(
    request="SUNNY",
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

**request:** `WeatherReport` 
    
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

## Endpoints HttpMethods
<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_get</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.http_methods.test_get(
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

**id:** `str` 
    
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

<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_post</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.http_methods.test_post(
    string="string",
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

**string:** `str` 
    
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

<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_put</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.http_methods.test_put(
    id="id",
    string="string",
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

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**string:** `str` 
    
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

<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_patch</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime
import uuid

from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.http_methods.test_patch(
    id="id",
    string="string",
    integer=1,
    long_=1000000,
    double=1.1,
    bool_=True,
    datetime=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    date=datetime.date.fromisoformat(
        "2023-01-15",
    ),
    uuid_=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    base_64="SGVsbG8gd29ybGQh",
    list_=["list", "list"],
    set_={"set"},
    map_={1: "map"},
    bigint=1000000,
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

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**string:** `typing.Optional[str]` — This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    
</dd>
</dl>

<dl>
<dd>

**integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**long_:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**double:** `typing.Optional[float]` 
    
</dd>
</dl>

<dl>
<dd>

**bool_:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `typing.Optional[dt.datetime]` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `typing.Optional[dt.date]` 
    
</dd>
</dl>

<dl>
<dd>

**uuid_:** `typing.Optional[uuid.UUID]` 
    
</dd>
</dl>

<dl>
<dd>

**base_64:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**list_:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**set_:** `typing.Optional[typing.Set[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**map_:** `typing.Optional[typing.Dict[int, str]]` 
    
</dd>
</dl>

<dl>
<dd>

**bigint:** `typing.Optional[str]` 
    
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

<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_delete</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.http_methods.test_delete(
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

**id:** `str` 
    
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

## Endpoints Object
<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_with_optional_field</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime
import uuid

from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.object.get_and_return_with_optional_field(
    string="string",
    integer=1,
    long_=1000000,
    double=1.1,
    bool_=True,
    datetime=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
    ),
    date=datetime.date.fromisoformat(
        "2023-01-15",
    ),
    uuid_=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
    base_64="SGVsbG8gd29ybGQh",
    list_=["list", "list"],
    set_={"set"},
    map_={1: "map"},
    bigint=1000000,
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

**string:** `typing.Optional[str]` — This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    
</dd>
</dl>

<dl>
<dd>

**integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**long_:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**double:** `typing.Optional[float]` 
    
</dd>
</dl>

<dl>
<dd>

**bool_:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**datetime:** `typing.Optional[dt.datetime]` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `typing.Optional[dt.date]` 
    
</dd>
</dl>

<dl>
<dd>

**uuid_:** `typing.Optional[uuid.UUID]` 
    
</dd>
</dl>

<dl>
<dd>

**base_64:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**list_:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**set_:** `typing.Optional[typing.Set[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**map_:** `typing.Optional[typing.Dict[int, str]]` 
    
</dd>
</dl>

<dl>
<dd>

**bigint:** `typing.Optional[str]` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_with_required_field</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.object.get_and_return_with_required_field(
    string="string",
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

**string:** `str` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_with_map_of_map</a>(...)</code></summary>
