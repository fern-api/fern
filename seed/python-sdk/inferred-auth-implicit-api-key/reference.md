# Reference
## Auth
<details><summary><code>client.auth.<a href="src/seed/auth/client.py">get_token</a>(...) -&gt; AsyncHttpResponse[TokenResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedInferredAuthImplicitApiKey

client = SeedInferredAuthImplicitApiKey(
    base_url="https://yourhost.com/path/to/api",
)
client.auth.get_token(
    api_key="api_key",
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

**api_key:** `str` 
    
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

## NestedNoAuth Api
<details><summary><code>client.nested_no_auth.api.<a href="src/seed/nested_no_auth/api/client.py">get_something</a>() -&gt; AsyncHttpResponse[None]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedInferredAuthImplicitApiKey

client = SeedInferredAuthImplicitApiKey(
    base_url="https://yourhost.com/path/to/api",
)
client.nested_no_auth.api.get_something()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Nested Api
<details><summary><code>client.nested.api.<a href="src/seed/nested/api/client.py">get_something</a>() -&gt; AsyncHttpResponse[None]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedInferredAuthImplicitApiKey

client = SeedInferredAuthImplicitApiKey(
    base_url="https://yourhost.com/path/to/api",
)
client.nested.api.get_something()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.simple.<a href="src/seed/simple/client.py">get_something</a>() -&gt; AsyncHttpResponse[None]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedInferredAuthImplicitApiKey

client = SeedInferredAuthImplicitApiKey(
    base_url="https://yourhost.com/path/to/api",
)
client.simple.get_something()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

