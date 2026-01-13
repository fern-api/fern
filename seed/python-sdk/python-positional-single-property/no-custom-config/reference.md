# Reference
<details><summary><code>client.<a href="src/seed/client.py">create</a>(...) -> AsyncHttpResponse[str]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import (
    BondSingleLeg,
    Isin,
    Quantity,
    SeedPythonPositionalSingleProperty,
    TakerParty,
    Trader,
)

client = SeedPythonPositionalSingleProperty(
    base_url="https://yourhost.com/path/to/api",
)
client.create(
    instrument=BondSingleLeg(
        identifier=Isin(
            isin="US0378331005",
        ),
        quantity=Quantity(
            quantity=10000.0,
        ),
    ),
    taker=TakerParty(
        trader=Trader(
            uuid_=1234567,
        ),
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

**instrument:** `BondSingleLeg` 
    
</dd>
</dl>

<dl>
<dd>

**taker:** `TakerParty` 
    
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

