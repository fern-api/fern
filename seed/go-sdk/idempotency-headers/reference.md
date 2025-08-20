# Reference
## Payment
<details><summary><code>client.Payment.Create(request) -> uuid.UUID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Payment.Create(
        context.TODO(),
        &fern.CreatePaymentRequest{
            Amount: 1,
            Currency: fern.CurrencyUsd,
        },
    )
}
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

**currency:** `*fern.Currency` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Payment.Delete(PaymentId) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Payment.Delete(
        context.TODO(),
        "paymentId",
    )
}
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

**paymentId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
