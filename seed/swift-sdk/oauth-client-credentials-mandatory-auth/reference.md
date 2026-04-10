# Reference
## Auth
<details><summary><code>client.auth.<a href="/Sources/Resources/Auth/AuthClient.swift">gettokenwithclientcredentials</a>(request: Requests.AuthGetTokenWithClientCredentialsRequest, requestOptions: RequestOptions?) -> TokenResponse</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.auth.gettokenwithclientcredentials(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials
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

**request:** `Requests.AuthGetTokenWithClientCredentialsRequest` 
    
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

<details><summary><code>client.auth.<a href="/Sources/Resources/Auth/AuthClient.swift">refreshtoken</a>(request: Requests.AuthRefreshTokenRequest, requestOptions: RequestOptions?) -> TokenResponse</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.auth.refreshtoken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        refreshToken: "refresh_token",
        audience: .httpsApiExampleCom,
        grantType: .refreshToken
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

**request:** `Requests.AuthRefreshTokenRequest` 
    
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

## NestedApi
<details><summary><code>client.nestedApi.<a href="/Sources/Resources/NestedApi/NestedApiClient.swift">nestedApiGetSomething</a>(requestOptions: RequestOptions?) -> Void</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.nestedApi.nestedApiGetSomething()
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
<details><summary><code>client.simple.<a href="/Sources/Resources/Simple/SimpleClient.swift">getsomething</a>(requestOptions: RequestOptions?) -> Void</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.simple.getsomething()
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

