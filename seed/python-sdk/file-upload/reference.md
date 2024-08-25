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
from seed import SeedFileUpload

client = SeedFileUpload(
    base_url="https://yourhost.com/path/to/api",
)
client.service.post()

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

**file:** `from __future__ import annotations

core.File` — See core.File for more documentation
    
</dd>
</dl>

<dl>
<dd>

**file_list:** `from __future__ import annotations

typing.List[core.File]` — See core.File for more documentation
    
</dd>
</dl>

<dl>
<dd>

**list_of_objects:** `typing.List[MyObject]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_file:** `from __future__ import annotations

typing.Optional[core.File]` — See core.File for more documentation
    
</dd>
</dl>

<dl>
<dd>

**maybe_file_list:** `from __future__ import annotations

typing.Optional[typing.List[core.File]]` — See core.File for more documentation
    
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
client.service.just_file()

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

**file:** `from __future__ import annotations

core.File` — See core.File for more documentation
    
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
from seed import SeedFileUpload

client = SeedFileUpload(
    base_url="https://yourhost.com/path/to/api",
)
client.service.just_file_with_query_params(
    maybe_string="string",
    integer=1,
    maybe_integer=1,
    list_of_strings="string",
    optional_list_of_strings="string",
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

**file:** `from __future__ import annotations

core.File` — See core.File for more documentation
    
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

