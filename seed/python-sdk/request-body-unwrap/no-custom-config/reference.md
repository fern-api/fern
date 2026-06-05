# Reference
## Payment
<details><summary><code>client.payment.<a href="src/seed/payment/client.py">create_payment</a>(...) -> Payment</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.payment import CreatePaymentRequestData, CreatePaymentRequestDataAttributes

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.payment.create_payment(
    data=CreatePaymentRequestData(
        type="payment",
        attributes=CreatePaymentRequestDataAttributes(
            amount=1,
            currency="currency",
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

**data:** `CreatePaymentRequestData` 
    
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

<details><summary><code>client.payment.<a href="src/seed/payment/client.py">get_payment</a>(...) -> Payment</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.payment.get_payment(
    payment_id="payment_id",
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

## Transfer
<details><summary><code>client.transfer.<a href="src/seed/transfer/client.py">create_transfer</a>(...) -> Transfer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.transfer import CreateTransferRequestAttributes

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.transfer.create_transfer(
    attributes=CreateTransferRequestAttributes(
        amount=1,
        source_account_id="source_account_id",
        destination_account_id="destination_account_id",
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

**attributes:** `CreateTransferRequestAttributes` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `typing.Optional[typing.Dict[str, str]]` 
    
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

