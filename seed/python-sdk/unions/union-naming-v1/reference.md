# Reference
## Bigunion
<details><summary><code>client.bigunion.<a href="src/seed/bigunion/client.py">get</a>(...) -&gt; AsyncHttpResponse[BigUnion]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnions

client = SeedUnions(
    base_url="https://yourhost.com/path/to/api",
)
client.bigunion.get(
    id="id",
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

<details><summary><code>client.bigunion.<a href="src/seed/bigunion/client.py">update</a>(...) -&gt; AsyncHttpResponse[bool]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnions
from seed.bigunion import NormalSweetBigUnion

client = SeedUnions(
    base_url="https://yourhost.com/path/to/api",
)
client.bigunion.update(
    request=NormalSweetBigUnion(
        value="value",
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

**request:** `BigUnion` 
    
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

<details><summary><code>client.bigunion.<a href="src/seed/bigunion/client.py">update_many</a>(...) -&gt; AsyncHttpResponse[typing.Dict[str, bool]]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnions
from seed.bigunion import NormalSweetBigUnion

client = SeedUnions(
    base_url="https://yourhost.com/path/to/api",
)
client.bigunion.update_many(
    request=[
        NormalSweetBigUnion(
            value="value",
        ),
        NormalSweetBigUnion(
            value="value",
        ),
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

**request:** `typing.Sequence[BigUnion]` 
    
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

## Union
<details><summary><code>client.union.<a href="src/seed/union/client.py">get</a>(...) -&gt; AsyncHttpResponse[Shape]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnions

client = SeedUnions(
    base_url="https://yourhost.com/path/to/api",
)
client.union.get(
    id="id",
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

<details><summary><code>client.union.<a href="src/seed/union/client.py">update</a>(...) -&gt; AsyncHttpResponse[bool]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnions
from seed.union import CircleShape

client = SeedUnions(
    base_url="https://yourhost.com/path/to/api",
)
client.union.update(
    request=CircleShape(
        radius=1.1,
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

**request:** `Shape` 
    
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

