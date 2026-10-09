# Reference
<details><summary><code>client.<a href="src/seed/client.py">upload</a>(...)</code></summary>
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

client.upload(
    file=["example_file"],
    optional_files=["example_optional_files"],
    single_file="example_single_file",
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

**file:** `typing.List[core.File]` 
    
</dd>
</dl>

<dl>
<dd>

**single_file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**optional_files:** `typing.Optional[typing.List[core.File]]` 
    
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

