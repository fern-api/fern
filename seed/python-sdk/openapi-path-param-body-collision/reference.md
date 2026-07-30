# Reference
<details><summary><code>client.<a href="src/seed/client.py">update_profile_identifier</a>(...) -> UpdateProfileIdentifierResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    environment=SeedApiEnvironment.DEFAULT,
)

client.update_profile_identifier(
    profile_id="profile_123",
    id_type_path_param="email",
    id_type="phone",
    old_value="+13175556789",
    new_value="+13175556798",
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

**profile_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**id_type_path_param:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**id_type:** `str` — The identifier type to update.
    
</dd>
</dl>

<dl>
<dd>

**old_value:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**new_value:** `str` 
    
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

