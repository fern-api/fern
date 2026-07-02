# Reference
## Clients
<details><summary><code>client.clients.<a href="/Sources/Resources/Clients/ClientsClient.swift">create</a>(request: Requests.ClientRequest, requestOptions: RequestOptions?) -> ClientResponse</code></summary>
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

    _ = try await client.clients.create(request: .init(client: Client(
        name: "Acme Corp",
        email: "contact@acme.com"
    )))
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

**request:** `Requests.ClientRequest` 
    
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

