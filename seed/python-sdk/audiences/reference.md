# Reference
## FolderA Service
<details><summary><code>client.folder_a.service.<a href="src/seed/folder_a/service/client.py">get_direct_thread</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedAudiences
from seed.environment import SeedAudiencesEnvironment

client = SeedAudiences(
    environment=SeedAudiencesEnvironment.ENVIRONMENT_A,
)
client.folder_a.service.get_direct_thread(
    ids="ids",
    tags="tags",
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

**ids:** `typing.Union[str, typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `typing.Union[str, typing.Sequence[str]]` 
    
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

## FolderD Service
<details><summary><code>client.folder_d.service.<a href="src/seed/folder_d/service/client.py">get_direct_thread</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedAudiences
from seed.environment import SeedAudiencesEnvironment

client = SeedAudiences(
    environment=SeedAudiencesEnvironment.ENVIRONMENT_A,
)
client.folder_d.service.get_direct_thread()

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

## Foo
<details><summary><code>client.foo.<a href="src/seed/foo/client.py">find</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedAudiences
from seed.environment import SeedAudiencesEnvironment

client = SeedAudiences(
    environment=SeedAudiencesEnvironment.ENVIRONMENT_A,
)
client.foo.find(
    optional_string="optionalString",
    public_property="publicProperty",
    private_property=1,
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

**optional_string:** `OptionalString` 
    
</dd>
</dl>

<dl>
<dd>

**public_property:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**private_property:** `typing.Optional[int]` 
    
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

