# Reference
## Service
<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getWithApiKey</a>(requestOptions: RequestOptions?) -> String</code></summary>
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
import AuthEnvironmentVariables

private func main() async throws {
    let client = AuthEnvironmentVariablesClient(apiKey: "<value>")

    _ = try await client.service.getWithApiKey()
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getWithHeader</a>(xEndpointHeader: String, requestOptions: RequestOptions?) -> String</code></summary>
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
import AuthEnvironmentVariables

private func main() async throws {
    let client = AuthEnvironmentVariablesClient(apiKey: "<value>")

    _ = try await client.service.getWithHeader()
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

**xEndpointHeader:** `String` — Specifies the endpoint key.
    
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

