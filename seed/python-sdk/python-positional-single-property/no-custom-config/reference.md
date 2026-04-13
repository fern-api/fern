# Reference
## _
<details><summary><code>client._.<a href="src/seed/_/client.py">create</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, BondSingleLeg, Isin, Quantity, TakerParty, Trader

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client._.create(
    instrument=BondSingleLeg(
        identifier=Isin(
            isin="isin",
        ),
        quantity=Quantity(
            quantity=1.1,
            type="QUANTITY",
        ),
    ),
    taker=TakerParty(
        trader=Trader(
            uuid_=1,
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

