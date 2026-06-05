# Reference
## Payment
<details><summary><code>client.payment.<a href="/src/api/resources/payment/client/Client.ts">createPayment</a>({ ...params }) -> SeedApi.Payment</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.payment.createPayment({
    data: {
        type: "payment",
        attributes: {
            amount: 1,
            currency: "currency"
        }
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

**request:** `SeedApi.CreatePaymentRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PaymentClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment.<a href="/src/api/resources/payment/client/Client.ts">getPayment</a>({ ...params }) -> SeedApi.Payment</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.payment.getPayment({
    payment_id: "payment_id"
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

**request:** `SeedApi.GetPaymentRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PaymentClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Transfer
<details><summary><code>client.transfer.<a href="/src/api/resources/transfer/client/Client.ts">createTransfer</a>({ ...params }) -> SeedApi.Transfer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.transfer.createTransfer({
    attributes: {
        amount: 1,
        source_account_id: "source_account_id",
        destination_account_id: "destination_account_id"
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

**request:** `SeedApi.CreateTransferRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TransferClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

