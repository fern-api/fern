# Reference
<details><summary><code>client.<a href="/Sources/ApiClient.swift">getFoo</a>(optionalBaz: String?, optionalNullableBaz: String?, requiredBaz: String, requiredNullableBaz: String?, requestOptions: RequestOptions?) -> Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.getFoo(
        requiredBaz: "required_baz",
        requiredNullableBaz: "required_nullable_baz"
    )
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

**optionalBaz:** `String?` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**optionalNullableBaz:** `String?` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**requiredBaz:** `String` — A required baz
    
</dd>
</dl>

<dl>
<dd>

**requiredNullableBaz:** `String?` — A required baz
    
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

<details><summary><code>client.<a href="/Sources/ApiClient.swift">updateFoo</a>(id: String, xIdempotencyKey: String, request: Requests.UpdateFooRequest, requestOptions: RequestOptions?) -> Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.updateFoo(
        id: "id",
        request: .init(
            nullableText: "nullable_text",
            nullableNumber: 1.1,
            nonNullableText: "non_nullable_text"
        )
    )
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**xIdempotencyKey:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.UpdateFooRequest` 
    
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

