# Reference
## Payment
<details><summary><code>client.payment.<a href="/src/api/resources/payment/client/Client.ts">create</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.payment.create({
    amount: 1,
    currency: "USD"
});

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

**request:** `SeedIdempotencyHeaders.CreatePaymentRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Payment.IdempotentRequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment.<a href="/src/api/resources/payment/client/Client.ts">delete</a>(paymentId) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.payment.delete("paymentId");

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

<dl>
<dd>

**requestOptions:** `Payment.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
