# Reference
## Payment
<details><summary><code>client.Payment.Create(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.PaymentCreateRequest{
        Amount: 1,
        Currency: fern.CurrencyUsd,
    }
client.Payment.Create(
        context.TODO(),
        request,
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

<details><summary><code>client.Payment.Delete(PaymentID) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.PaymentDeleteRequest{
        PaymentID: "paymentId",
    }
client.Payment.Delete(
        context.TODO(),
        request,
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

**paymentID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

