# Reference
<details><summary><code>client.<a href="src/seed/client.py">bulk_update_tasks</a>(...) -> BulkUpdateTasksResponse</code></summary>
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

client.bulk_update_tasks()

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

**filter_assigned_to:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**filter_is_complete:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**filter_date:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `typing.Optional[str]` — Comma-separated list of fields to include in the response.
    
</dd>
</dl>

<dl>
<dd>

**assigned_to:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `typing.Optional[datetime.date]` 
    
</dd>
</dl>

<dl>
<dd>

**is_complete:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**text:** `typing.Optional[str]` 
    
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

