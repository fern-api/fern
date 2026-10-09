# Reference
## Clients
<details><summary><code>client.clients.<a href="src/seed/clients/client.py">create</a>(...) -> ClientResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, Client

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.clients.create(
    client=Client(
        name="Acme Corp",
        email="contact@acme.com",
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

**client:** `typing.Optional[Client]` 
    
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

