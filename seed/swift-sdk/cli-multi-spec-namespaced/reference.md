# Reference
## V1
<details><summary><code>client.v1.<a href="/Sources/Resources/V1/V1Client.swift">listUsers</a>(requestOptions: RequestOptions?) -> [UserV1]</code></summary>
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
    let client = ApiClient(
        token: "<token>",
        apiKey: "<X-Api-Key>"
    )

    _ = try await client.v1.listUsers()
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

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2
<details><summary><code>client.v2.<a href="/Sources/Resources/V2/V2Client.swift">listUsers</a>(pageSize: Int?, requestOptions: RequestOptions?) -> [UserV2]</code></summary>
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
    let client = ApiClient(
        token: "<token>",
        apiKey: "<X-Api-Key>"
    )

    _ = try await client.v1.listUsers()
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

**pageSize:** `Int?` 
    
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

