# Reference
## Payment
<details><summary><code>client.payment.<a href="src/seed/payment/client.py">create</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedIdempotencyHeaders

client = SeedIdempotencyHeaders(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.payment.create(
    amount=1,
    currency="USD",
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

**amount:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**currency:** `Currency` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_expiration:** `int` 
    
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

<details><summary><code>client.payment.<a href="src/seed/payment/client.py">delete</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedIdempotencyHeaders

client = SeedIdempotencyHeaders(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.payment.delete(
    payment_id="paymentId",
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

**payment_id:** `str` 
    
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

