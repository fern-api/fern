# Reference
<details><summary><code>client.<a href="src/seed/client.py">get_root</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import RequestTypeInlineType1, SeedObject

client = SeedObject(
    base_url="https://yourhost.com/path/to/api",
)
client.get_root(
    bar=RequestTypeInlineType1(
        foo="foo",
    ),
    foo="foo",
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

**bar:** `RequestTypeInlineType1` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `str` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">get_discriminated_union</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import (
    DiscriminatedUnion1_Type1,
    DiscriminatedUnion1InlineType1InlineType1,
    ReferenceType,
    SeedObject,
)

client = SeedObject(
    base_url="https://yourhost.com/path/to/api",
)
client.get_discriminated_union(
    bar=DiscriminatedUnion1_Type1(
        foo="foo",
        bar=DiscriminatedUnion1InlineType1InlineType1(
            foo="foo",
            ref=ReferenceType(
                foo="foo",
            ),
        ),
        ref=ReferenceType(
            foo="foo",
        ),
    ),
    foo="foo",
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

**bar:** `DiscriminatedUnion1` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `str` 
    
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

<details><summary><code>client.<a href="src/seed/client.py">get_undiscriminated_union</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import (
    ReferenceType,
    SeedObject,
    UndiscriminatedUnion1InlineType1,
    UndiscriminatedUnion1InlineType1InlineType1,
)

client = SeedObject(
    base_url="https://yourhost.com/path/to/api",
)
client.get_undiscriminated_union(
    bar=UndiscriminatedUnion1InlineType1(
        foo="foo",
        bar=UndiscriminatedUnion1InlineType1InlineType1(
            foo="foo",
            ref=ReferenceType(
                foo="foo",
            ),
        ),
        ref=ReferenceType(
            foo="foo",
        ),
    ),
    foo="foo",
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

**bar:** `UndiscriminatedUnion1` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `str` 
    
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

