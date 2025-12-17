# Reference
<details><summary><code>client.<a href="src/seed/client.py">create</a>(...) -> AsyncHttpResponse[Type]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedValidation

client = SeedValidation(
    base_url="https://yourhost.com/path/to/api",
)
client.create(
    decimal=2.2,
    even=100,
    name="fern",
    shape="SQUARE",
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

**decimal:** `float` 
    
</dd>
</dl>

<dl>
<dd>

**even:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**shape:** `Shape` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">get</a>(...) -> AsyncHttpResponse[Type]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedValidation

client = SeedValidation(
    base_url="https://yourhost.com/path/to/api",
)
client.get(
    decimal=2.2,
    even=100,
    name="fern",
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

**decimal:** `float` 
    
</dd>
</dl>

<dl>
<dd>

**even:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `str` 
    
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

