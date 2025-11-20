# Reference
## Optional
<details><summary><code>client.optional.<a href="/Sources/Resources/Optional/OptionalClient.swift">sendOptionalBody</a>(request: [String: JSONValue]?, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import ObjectsWithImports

private func main() async throws {
    let client = ObjectsWithImportsClient()

    _ = try await client.optional.sendOptionalBody(request: [
        "string": .object([
            "key": .string("value")
        ])
    ])
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

**request:** `[String: JSONValue]?` 
    
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

<details><summary><code>client.optional.<a href="/Sources/Resources/Optional/OptionalClient.swift">sendOptionalTypedBody</a>(request: SendOptionalBodyRequest?, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import ObjectsWithImports

private func main() async throws {
    let client = ObjectsWithImportsClient()

    _ = try await client.optional.sendOptionalTypedBody(request: SendOptionalBodyRequest(
        message: "message"
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

**request:** `SendOptionalBodyRequest?` 
    
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

<details><summary><code>client.optional.<a href="/Sources/Resources/Optional/OptionalClient.swift">sendOptionalNullableWithAllOptionalProperties</a>(actionId: String, id: String, request: Nullable<DeployParams>?, requestOptions: RequestOptions?) -> DeployResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import ObjectsWithImports

private func main() async throws {
    let client = ObjectsWithImportsClient()

    _ = try await client.optional.sendOptionalNullableWithAllOptionalProperties(
        actionId: "actionId",
        id: "id",
        request: .value(DeployParams(
            updateDraft: true
        ))
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

**actionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Nullable<DeployParams>?` 
    
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

