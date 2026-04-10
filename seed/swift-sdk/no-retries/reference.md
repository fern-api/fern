# Reference
## Retries
<details><summary><code>client.retries.<a href="/Sources/Resources/Retries/RetriesClient.swift">getUsers</a>(requestOptions: RequestOptions?) -> [User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import NoRetries

private func main() async throws {
    let client = NoRetriesClient()

    _ = try await client.retries.getUsers()
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

