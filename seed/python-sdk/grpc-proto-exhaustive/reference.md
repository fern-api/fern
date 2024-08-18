# Reference
## DataService
<details><summary><code>client.dataservice.<a href="src/seed/dataservice/client.py">upload</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Column, SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)
client.dataservice.upload(
    columns=[
        Column(
            id="id",
            values=[1.1],
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

**columns:** `typing.Sequence[Column]` 
    
</dd>
</dl>

<dl>
<dd>

**namespace:** `typing.Optional[str]` 
    
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

<details><summary><code>client.dataservice.<a href="src/seed/dataservice/client.py">delete</a>(...)</code></summary>
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
client.dataservice.delete()

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

**ids:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**delete_all:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**namespace:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `typing.Optional[Metadata]` 
    
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

<details><summary><code>client.dataservice.<a href="src/seed/dataservice/client.py">describe</a>(...)</code></summary>
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
client.dataservice.describe()

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

**filter:** `typing.Optional[Metadata]` 
    
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

<details><summary><code>client.dataservice.<a href="src/seed/dataservice/client.py">fetch</a>(...)</code></summary>
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
client.dataservice.fetch()

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

**ids:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
</dd>
</dl>

<dl>
<dd>

**namespace:** `typing.Optional[str]` 
    
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

<details><summary><code>client.dataservice.<a href="src/seed/dataservice/client.py">list</a>(...)</code></summary>
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
client.dataservice.list()

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

**prefix:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**pagination_token:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**namespace:** `typing.Optional[str]` 
    
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

<details><summary><code>client.dataservice.<a href="src/seed/dataservice/client.py">query</a>(...)</code></summary>
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
client.dataservice.query(
    top_k=1,
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

**top_k:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**namespace:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `typing.Optional[Metadata]` 
    
</dd>
</dl>

<dl>
<dd>

**include_values:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**include_metadata:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**queries:** `typing.Optional[typing.Sequence[QueryColumn]]` 
    
</dd>
</dl>

<dl>
<dd>

**column:** `typing.Optional[typing.Sequence[float]]` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**indexed_data:** `typing.Optional[IndexedData]` 
    
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

<details><summary><code>client.dataservice.<a href="src/seed/dataservice/client.py">update</a>(...)</code></summary>
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
client.dataservice.update(
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

**values:** `typing.Optional[typing.Sequence[float]]` 
    
</dd>
</dl>

<dl>
<dd>

**set_metadata:** `typing.Optional[Metadata]` 
    
</dd>
</dl>

<dl>
<dd>

**namespace:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**indexed_data:** `typing.Optional[IndexedData]` 
    
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

