# Reference
## Service
<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getWithBearerToken</a>(requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom api key
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
import BearerTokenEnvironmentVariable

private func main() async throws {
    let client = BearerTokenEnvironmentVariableClient(apiKey: "<token>")

    try await client.service.getWithBearerToken()
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
