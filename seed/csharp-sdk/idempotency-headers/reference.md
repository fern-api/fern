# Reference
## Payment
<details><summary><code>client.Payment.<a href="/src/SeedIdempotencyHeaders/Payment/PaymentClient.cs">CreateAsync</a>(CreatePaymentRequest { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Payment.CreateAsync(new CreatePaymentRequest { Amount = 1, Currency = Currency.Usd });
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

**request:** `CreatePaymentRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Payment.<a href="/src/SeedIdempotencyHeaders/Payment/PaymentClient.cs">DeleteAsync</a>(paymentId)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Payment.DeleteAsync("paymentId");
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
