# Reference
## Payment
<details><summary><code>client.Payment.<a href="/src/SeedApi/Payment/PaymentClient.cs">CreateAsync</a>(PaymentCreateRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Payment.CreateAsync(new PaymentCreateRequest { Amount = 1, Currency = Currency.Usd });
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

**request:** `PaymentCreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Payment.<a href="/src/SeedApi/Payment/PaymentClient.cs">DeleteAsync</a>(PaymentDeleteRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Payment.DeleteAsync(new PaymentDeleteRequest { PaymentId = "paymentId" });
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

**request:** `PaymentDeleteRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

