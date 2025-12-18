# Reference
## Auth
<details><summary><code>client.auth.<a href="/Sources/Resources/Auth/AuthClient.swift">getToken</a>(request: GetTokenRequest, requestOptions: RequestOptions?) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import OauthClientCredentialsReference

private func main() async throws {
    let client = OauthClientCredentialsReferenceClient()

    _ = try await client.auth.getToken(request: GetTokenRequest(
        clientId: "client_id",
        clientSecret: "client_secret"
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

**request:** `GetTokenRequest` 
    
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

## Simple
<details><summary><code>client.simple.<a href="/Sources/Resources/Simple/SimpleClient.swift">getSomething</a>(requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import OauthClientCredentialsReference

private func main() async throws {
    let client = OauthClientCredentialsReferenceClient()

    _ = try await client.simple.getSomething()
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

