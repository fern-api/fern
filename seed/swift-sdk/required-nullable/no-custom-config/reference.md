# Reference
## 
<details><summary><code>client..<a href="/Sources/Resources//Client.swift">getFoo</a>(optionalBaz: Nullable&lt;String&gt;?, optionalNullableBaz: Nullable&lt;String&gt;?, requiredBaz: String, requiredNullableBaz: Nullable&lt;String&gt;, requestOptions: RequestOptions?) -> Foo</code></summary>
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

    _ = try await client..getFoo(
        requiredBaz: "required_baz",
        requiredNullableBaz: .value("required_nullable_baz")
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

**optionalBaz:** `Nullable<String>?` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**optionalNullableBaz:** `Nullable<String>?` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**requiredBaz:** `String` — A required baz
    
</dd>
</dl>

<dl>
<dd>

**requiredNullableBaz:** `Nullable<String>` — A required baz
    
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

<details><summary><code>client..<a href="/Sources/Resources//Client.swift">updateFoo</a>(id: String, idempotencyKey: String, request: Requests.UpdateFooRequest, requestOptions: RequestOptions?) -> Foo</code></summary>
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

    _ = try await client..updateFoo(
        id: "id",
        request: .init()
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

**idempotencyKey:** `String` 
    
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

