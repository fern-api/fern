# Reference
## Endpoints Container
<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_list_of_primitives</a>(...) -> typing.List[str]</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.container.get_and_return_list_of_primitives(
    request=[
        "string",
        "string"
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

**request:** `typing.List[str]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_list_of_objects</a>(...) -> typing.List[ObjectWithRequiredField]</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.container.get_and_return_list_of_objects(
    request=[
        ObjectWithRequiredField(
            string="string",
        ),
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

**request:** `typing.List[ObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_set_of_primitives</a>(...) -> typing.Set[str]</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.container.get_and_return_set_of_primitives(
    request=[
        "string"
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_set_of_objects</a>(...) -> typing.Set[ObjectWithRequiredField]</code></summary>
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
    token="<token>",
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

**request:** `typing.Set[ObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_map_prim_to_prim</a>(...) -> typing.Dict[str, str]</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.container.get_and_return_map_prim_to_prim(
    request={
        "string": "string"
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_map_of_prim_to_object</a>(...) -> typing.Dict[str, ObjectWithRequiredField]</code></summary>
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
    token="<token>",
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_map_of_prim_to_undiscriminated_union</a>(...) -> typing.Dict[str, MixedType]</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.container.get_and_return_map_of_prim_to_undiscriminated_union(
    request={
        "string": 1.1
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

**request:** `typing.Dict[str, MixedType]` 
    
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

<details><summary><code>client.endpoints.container.<a href="src/seed/endpoints/container/client.py">get_and_return_optional</a>(...) -> typing.Optional[ObjectWithRequiredField]</code></summary>
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
    token="<token>",
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
from seed import SeedExhaustive
import datetime
import uuid

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.content_type.post_json_patch_content_type(
    string="string",
    integer=1,
    long_=1000000,
    double=1.1,
    bool_=True,
    datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    date=datetime.date.fromisoformat("2023-01-15"),
    uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    base_64="SGVsbG8gd29ybGQh",
    list_=[
        "list",
        "list"
    ],
    set_=[
        "set"
    ],
    map_={
        1: "map"
    },
    bigint="1000000",
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

**request:** `ObjectWithOptionalField` 
    
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
from seed import SeedExhaustive
import datetime
import uuid

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.content_type.post_json_patch_content_with_charset_type(
    string="string",
    integer=1,
    long_=1000000,
    double=1.1,
    bool_=True,
    datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    date=datetime.date.fromisoformat("2023-01-15"),
    uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    base_64="SGVsbG8gd29ybGQh",
    list_=[
        "list",
        "list"
    ],
    set_=[
        "set"
    ],
    map_={
        1: "map"
    },
    bigint="1000000",
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

**request:** `ObjectWithOptionalField` 
    
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
<details><summary><code>client.endpoints.enum.<a href="src/seed/endpoints/enum/client.py">get_and_return_enum</a>(...) -> WeatherReport</code></summary>
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
    token="<token>",
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
<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_get</a>(...) -> str</code></summary>
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
    token="<token>",
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

<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_post</a>(...) -> ObjectWithOptionalField</code></summary>
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
    token="<token>",
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

**request:** `ObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_put</a>(...) -> ObjectWithOptionalField</code></summary>
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
    token="<token>",
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

**request:** `ObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_patch</a>(...) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
import datetime
import uuid

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.http_methods.test_patch(
    id="id",
    string="string",
    integer=1,
    long_=1000000,
    double=1.1,
    bool_=True,
    datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    date=datetime.date.fromisoformat("2023-01-15"),
    uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    base_64="SGVsbG8gd29ybGQh",
    list_=[
        "list",
        "list"
    ],
    set_=[
        "set"
    ],
    map_={
        1: "map"
    },
    bigint="1000000",
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

**request:** `ObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.http_methods.<a href="src/seed/endpoints/http_methods/client.py">test_delete</a>(...) -> bool</code></summary>
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
    token="<token>",
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
<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_with_optional_field</a>(...) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
import datetime
import uuid

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.object.get_and_return_with_optional_field(
    string="string",
    integer=1,
    long_=1000000,
    double=1.1,
    bool_=True,
    datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    date=datetime.date.fromisoformat("2023-01-15"),
    uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    base_64="SGVsbG8gd29ybGQh",
    list_=[
        "list",
        "list"
    ],
    set_=[
        "set"
    ],
    map_={
        1: "map"
    },
    bigint="1000000",
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

**request:** `ObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_with_required_field</a>(...) -> ObjectWithRequiredField</code></summary>
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
    token="<token>",
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

**request:** `ObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_with_map_of_map</a>(...) -> ObjectWithMapOfMap</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.object.get_and_return_with_map_of_map(
    map_={
        "map": {
            "map": "map"
        }
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

**request:** `ObjectWithMapOfMap` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_nested_with_optional_field</a>(...) -> NestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithOptionalField
import datetime
import uuid

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.object.get_and_return_nested_with_optional_field(
    string="string",
    nested_object=ObjectWithOptionalField(
        string="string",
        integer=1,
        long_=1000000,
        double=1.1,
        bool_=True,
        datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
        date=datetime.date.fromisoformat("2023-01-15"),
        uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        base_64="SGVsbG8gd29ybGQh",
        list_=[
            "list",
            "list"
        ],
        set_=[
            "set"
        ],
        map_={
            1: "map"
        },
        bigint="1000000",
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

**request:** `NestedObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_nested_with_required_field</a>(...) -> NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithOptionalField
import datetime
import uuid

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.object.get_and_return_nested_with_required_field(
    string_="string",
    string="string",
    nested_object=ObjectWithOptionalField(
        string="string",
        integer=1,
        long_=1000000,
        double=1.1,
        bool_=True,
        datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
        date=datetime.date.fromisoformat("2023-01-15"),
        uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        base_64="SGVsbG8gd29ybGQh",
        list_=[
            "list",
            "list"
        ],
        set_=[
            "set"
        ],
        map_={
            1: "map"
        },
        bigint="1000000",
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

**string:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `NestedObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_nested_with_required_field_as_list</a>(...) -> NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.types.object import NestedObjectWithRequiredField, ObjectWithOptionalField
import datetime
import uuid

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.object.get_and_return_nested_with_required_field_as_list(
    request=[
        NestedObjectWithRequiredField(
            string="string",
            nested_object=ObjectWithOptionalField(
                string="string",
                integer=1,
                long_=1000000,
                double=1.1,
                bool_=True,
                datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
                date=datetime.date.fromisoformat("2023-01-15"),
                uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                base_64="SGVsbG8gd29ybGQh",
                list_=[
                    "list",
                    "list"
                ],
                set_=[
                    "set"
                ],
                map_={
                    1: "map"
                },
                bigint="1000000",
            ),
        ),
        NestedObjectWithRequiredField(
            string="string",
            nested_object=ObjectWithOptionalField(
                string="string",
                integer=1,
                long_=1000000,
                double=1.1,
                bool_=True,
                datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
                date=datetime.date.fromisoformat("2023-01-15"),
                uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                base_64="SGVsbG8gd29ybGQh",
                list_=[
                    "list",
                    "list"
                ],
                set_=[
                    "set"
                ],
                map_={
                    1: "map"
                },
                bigint="1000000",
            ),
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

**request:** `typing.List[NestedObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_with_unknown_field</a>(...) -> ObjectWithUnknownField</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.object.get_and_return_with_unknown_field(
    unknown={"$ref": "https://example.com/schema"},
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

**request:** `ObjectWithUnknownField` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_with_documented_unknown_type</a>(...) -> ObjectWithDocumentedUnknownType</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.object.get_and_return_with_documented_unknown_type(
    documented_unknown_type={"key": "value"},
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

**request:** `ObjectWithDocumentedUnknownType` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_with_datetime_like_string</a>(...) -> ObjectWithDatetimeLikeString</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that string fields containing datetime-like values are NOT reformatted.
The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
without being converted to "2023-08-31T14:15:22.000Z".
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
import datetime

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.object.get_and_return_with_datetime_like_string(
    datetime_like_string="2023-08-31T14:15:22Z",
    actual_datetime=datetime.datetime.fromisoformat("2023-08-31T14:15:22+00:00"),
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

**request:** `ObjectWithDatetimeLikeString` 
    
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

## Endpoints Pagination
<details><summary><code>client.endpoints.pagination.<a href="src/seed/endpoints/pagination/client.py">list_items</a>(...) -> PaginatedResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List items with cursor pagination
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.pagination.list_items(
    cursor="cursor",
    limit=1,
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

**cursor:** `typing.Optional[str]` — The cursor for pagination
    
</dd>
</dl>

<dl>
<dd>

**limit:** `typing.Optional[int]` — Maximum number of items to return
    
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

## Endpoints Params
<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">get_with_path</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.params.get_with_path(
    param="param",
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

**param:** `str` 
    
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

<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">get_with_inline_path</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.params.get_with_path(
    param="param",
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

**param:** `str` 
    
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

<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">get_with_query</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with query param
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.params.get_with_query(
    query="query",
    number=1,
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

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `int` 
    
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

<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">get_with_allow_multiple_query</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with multiple of same query param
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.params.get_with_query(
    query="query",
    number=1,
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

**query:** `typing.Union[str, typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `typing.Union[int, typing.Sequence[int]]` 
    
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

<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">get_with_path_and_query</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.params.get_with_path_and_query(
    param="param",
    query="query",
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

**param:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
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

<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">get_with_inline_path_and_query</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.params.get_with_path_and_query(
    param="param",
    query="query",
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

**param:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
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

<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">modify_with_path</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.params.modify_with_path(
    param="param",
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

**param:** `str` 
    
</dd>
</dl>

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

<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">modify_with_inline_path</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.params.modify_with_path(
    param="param",
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

**param:** `str` 
    
</dd>
</dl>

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

<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">upload_with_path</a>(...) -> ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST bytes with path param returning object
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.params.upload_with_path(
    param="upload-path",
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

**param:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `typing.Union[bytes, typing.Iterator[bytes], typing.AsyncIterator[bytes]]` 
    
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

## Endpoints Primitive
<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_string</a>(...) -> str</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.primitive.get_and_return_string(
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_int</a>(...) -> int</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.primitive.get_and_return_int(
    request=1,
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

**request:** `int` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_long</a>(...) -> int</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.primitive.get_and_return_long(
    request=1000000,
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

**request:** `int` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_double</a>(...) -> float</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.primitive.get_and_return_double(
    request=1.1,
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

**request:** `float` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_bool</a>(...) -> bool</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.primitive.get_and_return_bool(
    request=True,
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

**request:** `bool` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_datetime</a>(...) -> datetime.datetime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
import datetime

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.primitive.get_and_return_datetime(
    request=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
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

**request:** `datetime.datetime` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_date</a>(...) -> datetime.date</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
import datetime

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.primitive.get_and_return_date(
    request=datetime.date.fromisoformat("2023-01-15"),
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

**request:** `datetime.date` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_uuid</a>(...) -> uuid.UUID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
import uuid

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.primitive.get_and_return_uuid(
    request=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
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

**request:** `uuid.UUID` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_base_64</a>(...) -> str</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.primitive.get_and_return_base_64(
    request="SGVsbG8gd29ybGQh",
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

## Endpoints Put
<details><summary><code>client.endpoints.put.<a href="src/seed/endpoints/put/client.py">add</a>(...) -> PutResponse</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.put.add(
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

## Endpoints Union
<details><summary><code>client.endpoints.union.<a href="src/seed/endpoints/union/client.py">get_and_return_union</a>(...) -> Animal</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.union.get_and_return_union(
    request={
        "animal": "dog",
        "name": "name",
        "likes_to_woof": True
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

**request:** `Animal` 
    
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

## Endpoints Urls
<details><summary><code>client.endpoints.urls.<a href="src/seed/endpoints/urls/client.py">with_mixed_case</a>() -> str</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.urls.with_mixed_case()

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

<details><summary><code>client.endpoints.urls.<a href="src/seed/endpoints/urls/client.py">no_ending_slash</a>() -> str</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.urls.no_ending_slash()

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

<details><summary><code>client.endpoints.urls.<a href="src/seed/endpoints/urls/client.py">with_ending_slash</a>() -> str</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.urls.with_ending_slash()

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

<details><summary><code>client.endpoints.urls.<a href="src/seed/endpoints/urls/client.py">with_underscores</a>() -> str</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints.urls.with_underscores()

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

## InlinedRequests
<details><summary><code>client.inlined_requests.<a href="src/seed/inlined_requests/client.py">post_with_object_bodyand_response</a>(...) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST with custom object in request body, response is an object
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
from seed.types.object import ObjectWithOptionalField
import datetime
import uuid

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inlined_requests.post_with_object_bodyand_response(
    string="string",
    integer=1,
    nested_object=ObjectWithOptionalField(
        string="string",
        integer=1,
        long_=1000000,
        double=1.1,
        bool_=True,
        datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
        date=datetime.date.fromisoformat("2023-01-15"),
        uuid_=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        base_64="SGVsbG8gd29ybGQh",
        list_=[
            "list",
            "list"
        ],
        set_=[
            "set"
        ],
        map_={
            1: "map"
        },
        bigint="1000000",
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

**string:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**integer:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**nested_object:** `ObjectWithOptionalField` 
    
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

## NoAuth
<details><summary><code>client.no_auth.<a href="src/seed/no_auth/client.py">post_with_no_auth</a>(...) -> bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with no auth
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

client = SeedExhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.no_auth.post_with_no_auth(
    request={"key": "value"},
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

**request:** `typing.Any` 
    
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

## NoReqBody
<details><summary><code>client.no_req_body.<a href="src/seed/no_req_body/client.py">get_with_no_request_body</a>() -> ObjectWithOptionalField</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.no_req_body.get_with_no_request_body()

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

<details><summary><code>client.no_req_body.<a href="src/seed/no_req_body/client.py">post_with_no_request_body</a>() -> str</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.no_req_body.post_with_no_request_body()

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

## ReqWithHeaders
<details><summary><code>client.req_with_headers.<a href="src/seed/req_with_headers/client.py">get_with_custom_header</a>(...)</code></summary>
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
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.req_with_headers.get_with_custom_header(
    x_test_service_header="X-TEST-SERVICE-HEADER",
    x_test_endpoint_header="X-TEST-ENDPOINT-HEADER",
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

**x_test_endpoint_header:** `str` 
    
</dd>
</dl>

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

