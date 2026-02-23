# Reference
## Completions
<details><summary><code>client.completions.<a href="src/seed/completions/client.py">stream</a>(...) -&gt; typing.AsyncIterator[
    AsyncHttpResponse[typing.AsyncIterator[StreamedCompletion]]
]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedServerSentEvents

client = SeedServerSentEvents(
    base_url="https://yourhost.com/path/to/api",
)
response = client.completions.stream(
    query="query",
)
for chunk in response.data:
    yield chunk

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

**query:** `str` 
    
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

<details><summary><code>client.completions.<a href="src/seed/completions/client.py">stream_without_terminator</a>(...) -&gt; typing.AsyncIterator[
    AsyncHttpResponse[typing.AsyncIterator[StreamedCompletion]]
]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedServerSentEvents

client = SeedServerSentEvents(
    base_url="https://yourhost.com/path/to/api",
)
response = client.completions.stream_without_terminator(
    query="query",
)
for chunk in response.data:
    yield chunk

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

**query:** `str` 
    
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

