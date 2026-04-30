# Reference
## Events
<details><summary><code>client.events.<a href="src/seed/events/client.py">subscribe</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Subscribe to events with a oneOf-style query parameter that may be a
scalar enum value or a list of enum values.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnionQueryParameters

client = SeedUnionQueryParameters(
    base_url="https://yourhost.com/path/to/api",
)

client.events.subscribe(
    event_type="group.created",
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

**event_type:** `typing.Optional[EventTypeParam]` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `typing.Optional[StringOrListParam]` 
    
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

