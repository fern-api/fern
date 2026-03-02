# Reference
<details><summary><code>client.<a href="src/seed/client.py">create_user</a>(...) -&gt; AsyncHttpResponse[User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPropertyAccess, UserProfile, UserProfileVerification

client = SeedPropertyAccess(
    base_url="https://yourhost.com/path/to/api",
)
client.create_user(
    id="id",
    email="email",
    password="password",
    profile=UserProfile(
        name="name",
        verification=UserProfileVerification(
            verified="verified",
        ),
        ssn="ssn",
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

**id:** `str` — The unique identifier for the user.
    
</dd>
</dl>

<dl>
<dd>

**email:** `str` — The email address of the user.
    
</dd>
</dl>

<dl>
<dd>

**password:** `str` — The password for the user.
    
</dd>
</dl>

<dl>
<dd>

**profile:** `UserProfile` — User profile object
    
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

