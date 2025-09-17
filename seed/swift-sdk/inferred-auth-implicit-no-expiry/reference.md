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
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient()

    try await client.auth.getTokenWithClientCredentials(request: .init(
        xApiKey: "X-Api-Key",
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
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient()

    try await client.auth.refreshToken(request: .init(
        xApiKey: "X-Api-Key",
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

## NestedNoAuth Api
<details><summary><code>client.nestedNoAuth.api.<a href="/Sources/Resources/NestedNoAuth/Api/ApiClient.swift">getSomething</a>(requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient()

    try await client.nestedNoAuth.api.getSomething()
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

## Nested Api
<details><summary><code>client.nested.api.<a href="/Sources/Resources/Nested/Api/NestedApiClient.swift">getSomething</a>(requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient()

    try await client.nested.api.getSomething()
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
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient()

    try await client.simple.getSomething()
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
