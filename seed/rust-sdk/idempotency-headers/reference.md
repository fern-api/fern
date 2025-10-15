# Reference
## Payment
<details><summary><code>client.payment.<a href="/src/api/resources/payment/client.rs">create</a>(request: CreatePaymentRequest) -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_idempotency_headers::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = IdempotencyHeadersClient::new(config).expect("Failed to build client");
    client
        .payment
        .create(
            &CreatePaymentRequest {
                amount: 1,
                currency: Currency::Usd,
            },
            None,
        )
        .await;
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

**amount:** `i64` 
    
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

<details><summary><code>client.payment.<a href="/src/api/resources/payment/client.rs">delete</a>(payment_id: String) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_idempotency_headers::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = IdempotencyHeadersClient::new(config).expect("Failed to build client");
    client.payment.delete(&"paymentId".to_string(), None).await;
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

**payment_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
