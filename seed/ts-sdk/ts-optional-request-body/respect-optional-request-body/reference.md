# Reference
<details><summary><code>client.<a href="/src/Client.ts">refund</a>(id, { ...params }) -> SeedTsOptionalRequestBody.Refund</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Refund a payment, optionally with a partial amount.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.refund("refund-id");

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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTsOptionalRequestBody.RefundRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedTsOptionalRequestBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/Client.ts">bulkRefund</a>({ ...params }) -> SeedTsOptionalRequestBody.Refund[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Refund every payment, optionally with a partial amount.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.bulkRefund({
    amount: 1.1
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

**request:** `SeedTsOptionalRequestBody.RefundRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedTsOptionalRequestBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/Client.ts">refundWithHeader</a>({ ...params }) -> SeedTsOptionalRequestBody.Refund</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Refund a payment, passing the body alongside a header.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.refundWithHeader({
    "X-Idempotency-Key": "X-Idempotency-Key",
    body: {
        amount: 1.1
    }
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

**request:** `SeedTsOptionalRequestBody.RefundWithHeaderRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedTsOptionalRequestBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/Client.ts">requiredRefund</a>(id, { ...params }) -> SeedTsOptionalRequestBody.Refund</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Refund a payment, always with an amount.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.requiredRefund("id", {
    amount: 1.1
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTsOptionalRequestBody.RefundRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedTsOptionalRequestBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

