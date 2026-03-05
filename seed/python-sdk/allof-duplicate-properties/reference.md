# Reference
<details><summary><code>client.<a href="src/seed/client.py">create_plant_order</a>(...) -&gt; AsyncHttpResponse[PlantOrder]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates an order for a plant.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi()
client.create_plant_order(
    plant_id="plantId",
    order_id="orderId",
    amount=1.1,
    currency="currency",
    plant_name="plantName",
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

**plant_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**plant_name:** `str` — Name of the plant being ordered.
    
</dd>
</dl>

<dl>
<dd>

**order_id:** `str` — Unique identifier for the order.
    
</dd>
</dl>

<dl>
<dd>

**amount:** `float` — Total amount for the order.
    
</dd>
</dl>

<dl>
<dd>

**currency:** `str` — Currency code (e.g. USD, EUR).
    
</dd>
</dl>

<dl>
<dd>

**quantity:** `typing.Optional[int]` — Number of plants ordered.
    
</dd>
</dl>

<dl>
<dd>

**date_time:** `typing.Optional[dt.datetime]` — Timestamp when the order was placed.
    
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

