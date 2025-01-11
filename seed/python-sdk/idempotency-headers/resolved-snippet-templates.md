```python
from seed import SeedIdempotencyHeaders

client = SeedIdempotencyHeaders(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.payment.create(
	amount=1
)

```


```python
from seed import SeedIdempotencyHeaders

client = SeedIdempotencyHeaders(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.payment.delete(
	payment_id="paymentId"
)

```


