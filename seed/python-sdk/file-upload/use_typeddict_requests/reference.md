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
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.post(
    file="example_file",
    file_list="example_file_list",
    maybe_file="example_maybe_file",
    maybe_file_list="example_maybe_file_list",
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

**maybe_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**file_list:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_file_list:** `typing.Optional[core.File]` 
    
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

**list_of_objects:** `typing.Optional[typing.List[MyObject]]` 
    
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

**alias_object:** `typing.Optional[MyAliasObject]` 
    
</dd>
</dl>

<dl>
<dd>

**list_of_alias_object:** `typing.Optional[typing.List[MyAliasObject]]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_list_of_object:** `typing.Optional[MyCollectionAliasObject]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">justfile</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.justfile(
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

**file:** `typing.Optional[core.File]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">justfilewithqueryparams</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.service.justfilewithqueryparams(...)
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

**list_of_strings:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_list_of_strings:** `typing.Optional[typing.Union[typing.Optional[str], typing.Sequence[typing.Optional[str]]]]` 
    
</dd>
</dl>

<dl>
<dd>

**file:** `typing.Optional[core.File]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">justfilewithoptionalqueryparams</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.justfilewithoptionalqueryparams(
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

**file:** `typing.Optional[core.File]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">withcontenttype</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.withcontenttype(
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

**file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**bar:** `typing.Optional[MyObject]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">withformencoding</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.withformencoding(
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

**file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**bar:** `typing.Optional[MyObject]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">withformencodedcontainers</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.withformencodedcontainers(
    file="example_file",
    file_list="example_file_list",
    maybe_file="example_maybe_file",
    maybe_file_list="example_maybe_file_list",
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

**maybe_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**file_list:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_file_list:** `typing.Optional[core.File]` 
    
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

**list_of_objects:** `typing.Optional[typing.List[MyObject]]` 
    
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

**list_of_objects_with_optionals:** `typing.Optional[typing.List[MyObjectWithOptional]]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_object:** `typing.Optional[MyAliasObject]` 
    
</dd>
</dl>

<dl>
<dd>

**list_of_alias_object:** `typing.Optional[typing.List[MyAliasObject]]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_list_of_object:** `typing.Optional[MyCollectionAliasObject]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">optionalargs</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.optionalargs(
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">withinlinetype</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.withinlinetype(
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

**file:** `typing.Optional[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `typing.Optional[MyInlineType]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">withjsonproperty</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.withjsonproperty(
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

**file:** `typing.Optional[core.File]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">simple</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">withliteralandenumtypes</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.service.withliteralandenumtypes(
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

**file:** `typing.Optional[core.File]` 
    
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

