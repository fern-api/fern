# Reference
<details><summary><code>client.<a href="src/seed/client.py">get_root</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import InlineType1, NestedInlineType1, SeedObject

client = SeedObject(
    base_url="https://yourhost.com/path/to/api",
)
client.get_root(
    bar=InlineType1(
        foo="foo",
        bar=NestedInlineType1(
            foo="foo",
            bar="bar",
            my_enum="SUNNY",
        ),
    ),
    foo="foo",
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

**bar:** `InlineType1` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `str` 
    
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

