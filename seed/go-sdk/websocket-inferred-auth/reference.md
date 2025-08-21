# Reference
## Auth
<details><summary><code>client.Auth.GetTokenWithClientCredentials(request) -> *fern.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        &fern.GetTokenRequest{
            XApiKey: "X-Api-Key",
            ClientId: "client_id",
            ClientSecret: "client_secret",
            Scope: fern.String(
                "scope",
            ),
        },
    )
}
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

**xApiKey:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**clientId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `*string` 
    
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
client.Auth.RefreshToken(
        context.TODO(),
        &fern.RefreshTokenRequest{
            XApiKey: "X-Api-Key",
            ClientId: "client_id",
            ClientSecret: "client_secret",
            RefreshToken: "refresh_token",
            Scope: fern.String(
                "scope",
            ),
        },
    )
}
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

**xApiKey:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**clientId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**refreshToken:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
