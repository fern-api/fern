# Reference
## Bigunion
<details><summary><code>client.bigunion.<a href="src/seed/bigunion/client.py">get</a>(...) -> BigUnion</code></summary>
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

<details><summary><code>client.bigunion.<a href="src/seed/bigunion/client.py">update</a>(...) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnions
from seed.bigunion import BigUnion_NormalSweet
import datetime

client = SeedUnions(
    base_url="https://yourhost.com/path/to/api",
)

client.bigunion.update(
    request=BigUnion_NormalSweet(
        id="id",
        created_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
        archived_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
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

<details><summary><code>client.bigunion.<a href="src/seed/bigunion/client.py">update_many</a>(...) -> typing.Dict[str, bool]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnions
from seed.bigunion import BigUnion_NormalSweet
import datetime

client = SeedUnions(
    base_url="https://yourhost.com/path/to/api",
)

client.bigunion.update_many(
    request=[
        BigUnion_NormalSweet(
            id="id",
            created_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
            archived_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
            value="value",
        ),
        BigUnion_NormalSweet(
            id="id",
            created_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
            archived_at=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
            value="value",
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

**request:** `typing.List[BigUnion]` 
    
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
<details><summary><code>client.union.<a href="src/seed/union/client.py">get</a>(...) -> Shape</code></summary>
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

<details><summary><code>client.union.<a href="src/seed/union/client.py">update</a>(...) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnions
from seed.union import Shape_Circle

client = SeedUnions(
    base_url="https://yourhost.com/path/to/api",
)

client.union.update(
    request=Shape_Circle(
        id="id",
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

