# Reference
## Payment
<details><summary><code>$client->payment->create($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->payment->create(
    new CreatePaymentRequest([
        'amount' => 1,
        'currency' => Currency::Usd->value,
    ]),
);
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

**$amount:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$currency:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->payment->delete($paymentId)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->payment->delete(
    'paymentId',
);
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

**$paymentId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
