# Reference
## Service
<details><summary><code>client.service.<a href="src/seed/service/client.py">post</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.post(...)
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

**integer:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**file_list:** `typing.List[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**list_of_objects:** `typing.List[MyObject]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_object:** `MyAliasObject` 
    
</dd>
</dl>

<dl>
<dd>

**list_of_alias_object:** `typing.List[MyAliasObject]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_list_of_object:** `MyCollectionAliasObject` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_file_list:** `typing.Optional[typing.List[core.File]]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_list_of_strings:** `typing.Optional[typing.List[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_metadata:** `typing.Optional[typing.Any]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_object_type:** `typing.Optional[ObjectType]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_id:** `typing.Optional[Id]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">just_file</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedFileUpload

client = SeedFileUpload(
    base_url="https://yourhost.com/path/to/api",
)

client.service.just_file(
    file="example_file",
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

**file:** `core.File` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">just_file_with_query_params</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.just_file_with_query_params(...)
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

**integer:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**list_of_strings:** `typing.Union[str, typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_list_of_strings:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">just_file_with_optional_query_params</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.just_file_with_optional_query_params(...)
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

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_integer:** `typing.Optional[int]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">with_content_type</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.with_content_type(...)
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

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**bar:** `MyObject` 
    
</dd>
</dl>

<dl>
<dd>

**foo_bar:** `typing.Optional[MyObject]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">with_form_encoding</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.with_form_encoding(...)
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

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**bar:** `MyObject` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">with_form_encoded_containers</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.with_form_encoded_containers(...)
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

**integer:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**file_list:** `typing.List[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**list_of_objects:** `typing.List[MyObject]` 
    
</dd>
</dl>

<dl>
<dd>

**list_of_objects_with_optionals:** `typing.List[MyObjectWithOptional]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_object:** `MyAliasObject` 
    
</dd>
</dl>

<dl>
<dd>

**list_of_alias_object:** `typing.List[MyAliasObject]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_list_of_object:** `MyCollectionAliasObject` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_file_list:** `typing.Optional[typing.List[core.File]]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_list_of_strings:** `typing.Optional[typing.List[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_metadata:** `typing.Optional[typing.Any]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_object_type:** `typing.Optional[ObjectType]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_id:** `typing.Optional[Id]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">optional_args</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedFileUpload

client = SeedFileUpload(
    base_url="https://yourhost.com/path/to/api",
)

client.service.optional_args(
    image_file="example_image_file",
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

**image_file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

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

<details><summary><code>client.service.<a href="src/seed/service/client.py">with_inline_type</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.with_inline_type(...)
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

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `MyInlineType` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">with_json_property</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.with_json_property(...)
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

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**json:** `typing.Optional[MyObject]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">with_ref_body</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedFileUpload
from seed.service import MyObject

client = SeedFileUpload(
    base_url="https://yourhost.com/path/to/api",
)

client.service.with_ref_body(
    image_file="example_image_file",
    request=MyObject(
        foo="bar",
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

**request:** `MyObject` 
    
</dd>
</dl>

<dl>
<dd>

**image_file:** `typing.Optional[core.File]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">simple</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedFileUpload

client = SeedFileUpload(
    base_url="https://yourhost.com/path/to/api",
)

client.service.simple()

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

<details><summary><code>client.service.<a href="src/seed/service/client.py">with_literal_and_enum_types</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.with_literal_and_enum_types(...)
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

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**model_type:** `typing.Optional[ModelType]` 
    
</dd>
</dl>

<dl>
<dd>

**open_enum:** `typing.Optional[OpenEnumType]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_name:** `typing.Optional[str]` 
    
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

