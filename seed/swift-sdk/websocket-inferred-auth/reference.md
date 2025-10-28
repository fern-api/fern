# Reference
## Auth
<details><summary><code>client.auth.<a href="/Sources/Resources/Auth/AuthClient.swift">getTokenWithClientCredentials</a>(xApiKey: String, request: Requests.GetTokenRequest, requestOptions: RequestOptions?) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import WebsocketAuth

private func main() async throws {
    let client = WebsocketAuthClient()

    _ = try await client.auth.getTokenWithClientCredentials(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
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

**xApiKey:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.GetTokenRequest` 
    
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

<details><summary><code>client.auth.<a href="/Sources/Resources/Auth/AuthClient.swift">refreshToken</a>(xApiKey: String, request: Requests.RefreshTokenRequest, requestOptions: RequestOptions?) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import WebsocketAuth

private func main() async throws {
    let client = WebsocketAuthClient()

    _ = try await client.auth.refreshToken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        refreshToken: "refresh_token",
        audience: .httpsApiExampleCom,
        grantType: .refreshToken,
        scope: "scope"
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

**xApiKey:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.RefreshTokenRequest` 
    
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

