# Reference
## Dummy
<details><summary><code>client.dummy.<a href="src/seed/dummy/client.py">generate_stream</a>(...) -> typing.Iterator[bytes]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedStreaming

client = SeedStreaming(
    base_url="https://yourhost.com/path/to/api",
)

client.dummy.generate_stream(
    num_events=1,
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

**stream:** `typing.Literal` 
    
</dd>
</dl>

<dl>
<dd>

**num_events:** `int` 
    
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

<details><summary><code>client.dummy.<a href="src/seed/dummy/client.py">generate</a>(...) -> StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedStreaming

client = SeedStreaming(
    base_url="https://yourhost.com/path/to/api",
)

client.dummy.generate(
    num_events=5,
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

**stream:** `typing.Literal` 
    
</dd>
</dl>

<dl>
<dd>

**num_events:** `int` 
    
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

