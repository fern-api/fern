# Reference
## Service
<details><summary><code>client.Service.Create(request) -> uuid.UUID</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request that sends the idempotency headers
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreatePaymentRequest{
    Amount: 1,
}
client.Service.Create(
    context.TODO(),
    request,
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
</dd>
</dl>


</dd>
</dl>
</details>

