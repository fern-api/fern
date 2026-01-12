# Reference
<details><summary><code>client.<a href="src/seed/client.py">chat_stream</a>(...) -> typing.AsyncIterator[AsyncHttpResponse[typing.AsyncIterator[ChatStreamEvent]]]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Message, SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)
response = client.chat_stream(
    messages=[
        Message(
            role="user",
            content="content",
        )
    ],
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

**messages:** `typing.Sequence[Message]` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">chat</a>(...) -> AsyncHttpResponse[ChatResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Message, SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)
client.chat(
    messages=[
        Message(
            role="user",
            content="Hello",
        )
    ],
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

**messages:** `typing.Sequence[Message]` 
    
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

