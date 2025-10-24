# Reference
<details><summary><code>client.<a href="src/seed/client.py">test_direct_alias</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for direct alias serialization
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
from seed import SeedAliasSerialization

client = SeedAliasSerialization(
    base_url="https://yourhost.com/path/to/api",
)
client.test_direct_alias(
    alias_id="aliasId",
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

**alias_id:** `UuidAlias` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">test_alias_map</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for maps with alias keys
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
from seed import SeedAliasSerialization

client = SeedAliasSerialization(
    base_url="https://yourhost.com/path/to/api",
)
client.test_alias_map(
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

**request:** `UuidAliasMap` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">test_string_to_alias_map</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for maps with alias values
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
from seed import SeedAliasSerialization

client = SeedAliasSerialization(
    base_url="https://yourhost.com/path/to/api",
)
client.test_string_to_alias_map(
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

**request:** `StringToUuidMap` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">test_serialization_object</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for complex object serialization
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
from seed import SeedAliasSerialization

client = SeedAliasSerialization(
    base_url="https://yourhost.com/path/to/api",
)
client.test_serialization_object(
    direct_alias="directAlias",
    alias_in_map={"aliasInMap": "aliasInMap"},
    string_to_alias={"stringToAlias": "stringToAlias"},
    optional_alias="optionalAlias",
    alias_list=["aliasList", "aliasList"],
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

**direct_alias:** `UuidAlias` 
    
</dd>
</dl>

<dl>
<dd>

**alias_in_map:** `typing.Dict[UuidAlias, str]` 
    
</dd>
</dl>

<dl>
<dd>

**string_to_alias:** `typing.Dict[str, UuidAlias]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_list:** `typing.Sequence[UuidAlias]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_alias:** `typing.Optional[UuidAlias]` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">test_nested_serialization</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for nested object serialization
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
from seed import SeedAliasSerialization, SerializationTestObject

client = SeedAliasSerialization(
    base_url="https://yourhost.com/path/to/api",
)
client.test_nested_serialization(
    id="id",
    nested=SerializationTestObject(
        direct_alias="directAlias",
        alias_in_map={"aliasInMap": "aliasInMap"},
        string_to_alias={"stringToAlias": "stringToAlias"},
        optional_alias="optionalAlias",
        alias_list=["aliasList", "aliasList"],
    ),
    nested_list=[
        SerializationTestObject(
            direct_alias="directAlias",
            alias_in_map={"aliasInMap": "aliasInMap"},
            string_to_alias={"stringToAlias": "stringToAlias"},
            optional_alias="optionalAlias",
            alias_list=["aliasList", "aliasList"],
        ),
        SerializationTestObject(
            direct_alias="directAlias",
            alias_in_map={"aliasInMap": "aliasInMap"},
            string_to_alias={"stringToAlias": "stringToAlias"},
            optional_alias="optionalAlias",
            alias_list=["aliasList", "aliasList"],
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

**id:** `UuidAlias` 
    
</dd>
</dl>

<dl>
<dd>

**nested:** `SerializationTestObject` 
    
</dd>
</dl>

<dl>
<dd>

**nested_list:** `typing.Sequence[SerializationTestObject]` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">test_query_param</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with alias in query parameter
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
from seed import SeedAliasSerialization

client = SeedAliasSerialization(
    base_url="https://yourhost.com/path/to/api",
)
client.test_query_param(
    alias_param="aliasParam",
    optional_alias_param="optionalAliasParam",
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

**alias_param:** `UuidAlias` 
    
</dd>
</dl>

<dl>
<dd>

**optional_alias_param:** `typing.Optional[UuidAlias]` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">test_header</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with alias in header
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
from seed import SeedAliasSerialization

client = SeedAliasSerialization(
    base_url="https://yourhost.com/path/to/api",
)
client.test_header(
    x_uuid_alias="X-Uuid-Alias",
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

**x_uuid_alias:** `UuidAlias` 
    
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

