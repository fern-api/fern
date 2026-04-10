# Reference
## Payment
<details><summary><code>client.payment.create(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.payment().create(
    PaymentCreateRequest
        .builder()
        .amount(1)
        .currency(Currency.USD)
        .build()
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

**amount:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**currency:** `Currency` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment.delete(paymentId)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.payment().delete(
    "paymentId",
    PaymentDeleteRequest
        .builder()
        .build()
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

**paymentId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

