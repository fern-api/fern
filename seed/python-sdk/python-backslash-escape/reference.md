# Reference
## User
<details><summary><code>client.user.<a href="src/seed/user/client.py">get</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a user by their ID.
For Windows authentication, use DOMAIN\username format.
Other backslash examples: FOO\_BAR, path\to\file, C:\Users\name
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
from seed import SeedPythonBackslashEscape

client = SeedPythonBackslashEscape(
    base_url="https://yourhost.com/path/to/api",
)
client.user.get(
    id="id",
    domain="domain",
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

The user ID.
Can be in DOMAIN\username format for Windows users.
    
</dd>
</dl>

<dl>
<dd>

**domain:** `typing.Optional[str]` 

The domain name.
Example: CORP\username or DOMAIN\user
    
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

