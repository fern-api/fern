# Reference
## Payment
<details><summary><code>client.payment.<a href="/Sources/Resources/Payment/PaymentClient.swift">create</a>(request: Requests.CreatePaymentRequest, requestOptions: RequestOptions?) -> UUID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import IdempotencyHeaders

private func main() async throws {
    let client = IdempotencyHeadersClient(token: "<token>")

    _ = try await client.payment.create(request: .init(
        amount: 1,
        currency: .usd
    ))
}

try await main()
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

**request:** `Requests.CreatePaymentRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment.<a href="/Sources/Resources/Payment/PaymentClient.swift">delete</a>(paymentId: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import IdempotencyHeaders

private func main() async throws {
    let client = IdempotencyHeadersClient(token: "<token>")

    _ = try await client.payment.delete(paymentId: "paymentId")
}

try await main()
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

**paymentId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

