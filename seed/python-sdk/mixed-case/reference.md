# Reference
## Service
<details><summary><code>client.service.<a href="src/seed/service/client.py">get_resource</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedMixedCase

client = SeedMixedCase(
    base_url="https://yourhost.com/path/to/api",
)
client.service.get_resource(
    resource_id="rsc-xyz",
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

**resource_id:** `str` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">list_resources</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime

from seed import SeedMixedCase

client = SeedMixedCase(
    base_url="https://yourhost.com/path/to/api",
)
client.service.list_resources(
    page_limit=10,
    before_date=datetime.date.fromisoformat(
        "2023-01-01",
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

**page_limit:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**before_date:** `dt.date` 
    
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

