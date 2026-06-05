# Reference
## Payment
<details><summary><code>client.Payment.CreatePayment(request) -> *fern.Payment</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreatePaymentRequest{
        Data: &fern.CreatePaymentRequestData{
            Type: fern.CreatePaymentRequestDataTypePayment,
            Attributes: &fern.CreatePaymentRequestDataAttributes{
                Amount: 1,
                Currency: "currency",
            },
        },
    }
client.Payment.CreatePayment(
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

**data:** `*fern.CreatePaymentRequestData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Payment.GetPayment(PaymentID) -> *fern.Payment</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetPaymentRequest{
        PaymentID: "payment_id",
    }
client.Payment.GetPayment(
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

## Transfer
<details><summary><code>client.Transfer.CreateTransfer(request) -> *fern.Transfer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreateTransferRequest{
        Attributes: &fern.CreateTransferRequestAttributes{
            Amount: 1,
            SourceAccountID: "source_account_id",
            DestinationAccountID: "destination_account_id",
        },
    }
client.Transfer.CreateTransfer(
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

**attributes:** `*fern.CreateTransferRequestAttributes` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `map[string]string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

