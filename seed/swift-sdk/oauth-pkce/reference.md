# Reference
## Oauth
<details><summary><code>client.oauth.<a href="/Sources/Resources/Oauth/OauthClient.swift">authorize</a>(responseType: JSONValue, clientId: String, redirectUri: String, codeChallenge: String, codeChallengeMethod: JSONValue?, scope: String?, state: String?, requestOptions: RequestOptions?) -> AuthorizeResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Authorization-code grant with PKCE. `response_type` is a required literal that is
hardcoded by the generated method; `code_challenge_method` is an optional literal
that must still be sent on the wire when provided.
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
import OauthPkce

private func main() async throws {
    let client = OauthPkceClient()

    _ = try await client.oauth.authorize(
        responseType: .code,
        clientId: "client_abc123",
        redirectUri: "https://example.com/callback",
        codeChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
        codeChallengeMethod: .s256,
        scope: "read write",
        state: "xyz"
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

**responseType:** `JSONValue` 
    
</dd>
</dl>

<dl>
<dd>

**clientId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**redirectUri:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**codeChallenge:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**codeChallengeMethod:** `JSONValue?` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**state:** `String?` 
    
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

