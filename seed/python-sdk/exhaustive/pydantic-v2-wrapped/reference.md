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
client.endpoints.object.get_and_return_with_map_of_map(
    map_={"map": {"map": "map"}},
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

**map_:** `typing.Dict[str, typing.Dict[str, str]]` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_nested_with_optional_field</a>(...)</code></summary>
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
from seed.types.object import ObjectWithOptionalField

client = SeedExhaustive(
    token="YOUR_TOKEN",
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

**string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**nested_object:** `typing.Optional[ObjectWithOptionalField]` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_nested_with_required_field</a>(...)</code></summary>
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
from seed.types.object import ObjectWithOptionalField

client = SeedExhaustive(
    token="YOUR_TOKEN",
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

**string_:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**string:** `str` 
    
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

<details><summary><code>client.endpoints.object.<a href="src/seed/endpoints/object/client.py">get_and_return_nested_with_required_field_as_list</a>(...)</code></summary>
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
from seed.types.object import (
    NestedObjectWithRequiredField,
    ObjectWithOptionalField,
)

client = SeedExhaustive(
    token="YOUR_TOKEN",
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
            ),
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

**request:** `typing.Sequence[NestedObjectWithRequiredField]` 
    
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
<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">get_with_path</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
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
    token="YOUR_TOKEN",
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.params.get_with_allow_multiple_query(
    query="query",
    numer=1,
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

**numer:** `typing.Union[int, typing.Sequence[int]]` 
    
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
    token="YOUR_TOKEN",
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

<details><summary><code>client.endpoints.params.<a href="src/seed/endpoints/params/client.py">modify_with_path</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
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

## Endpoints Primitive
<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_string</a>(...)</code></summary>
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_int</a>(...)</code></summary>
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_long</a>(...)</code></summary>
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_double</a>(...)</code></summary>
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_bool</a>(...)</code></summary>
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_datetime</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime

from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.primitive.get_and_return_datetime(
    request=datetime.datetime.fromisoformat(
        "2024-01-15 09:30:00+00:00",
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

**request:** `dt.datetime` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_date</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime

from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.primitive.get_and_return_date(
    request=datetime.date.fromisoformat(
        "2023-01-15",
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

**request:** `dt.date` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_uuid</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import uuid

from seed import SeedExhaustive

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.primitive.get_and_return_uuid(
    request=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
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

<details><summary><code>client.endpoints.primitive.<a href="src/seed/endpoints/primitive/client.py">get_and_return_base_64</a>(...)</code></summary>
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

## Endpoints Union
<details><summary><code>client.endpoints.union.<a href="src/seed/endpoints/union/client.py">get_and_return_union</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedExhaustive
from seed.types.union import Animal_Dog

client = SeedExhaustive(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.endpoints.union.get_and_return_union(
    request=Animal_Dog(
        name="name",
        likes_to_woof=True,
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

## InlinedRequests
<details><summary><code>client.inlined_requests.<a href="src/seed/inlined_requests/client.py">post_with_object_bodyand_response</a>(...)</code></summary>
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
import datetime
import uuid

from seed import SeedExhaustive
from seed.types.object import ObjectWithOptionalField

client = SeedExhaustive(
    token="YOUR_TOKEN",
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
<details><summary><code>client.no_auth.<a href="src/seed/no_auth/client.py">post_with_no_auth</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
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

**request:** `typing.Optional[typing.Any]` 
    
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
<details><summary><code>client.no_req_body.<a href="src/seed/no_req_body/client.py">get_with_no_request_body</a>()</code></summary>
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

<details><summary><code>client.no_req_body.<a href="src/seed/no_req_body/client.py">post_with_no_request_body</a>()</code></summary>
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
    token="YOUR_TOKEN",
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

**x_test_service_header:** `str` 
    
</dd>
</dl>

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

