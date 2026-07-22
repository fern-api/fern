# Reference
## Auth
<details><summary><code>client.Auth.GetToken(request) -> *fern.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetTokenAuthRequest{
    ClientID: "client_id",
    ClientSecret: "client_secret",
    Scopes: "scopes",
    GrantType: fern.GetTokenAuthRequestGrantTypeClientCredentials,
    Tenant: "tenant",
}
client.Auth.GetToken(
    context.TODO(),
    request,
)
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

**audience:** `*fern.GetTokenAuthRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**clientID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**scopes:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `*fern.GetTokenAuthRequestGrantType` 
    
</dd>
</dl>

<dl>
<dd>

**tenant:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**optionalHint:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Auth.RefreshToken(request) -> *fern.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.RefreshTokenAuthRequest{
    RefreshToken: "refresh_token",
    GrantType: fern.RefreshTokenAuthRequestGrantTypeRefreshToken,
}
client.Auth.RefreshToken(
    context.TODO(),
    request,
)
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

**refreshToken:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `*fern.RefreshTokenAuthRequestGrantType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## System
<details><summary><code>client.System.Health() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.System.Health(
    context.TODO(),
)
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Pets
<details><summary><code>client.Pets.List() -> []string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Pets.List(
    context.TODO(),
)
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

