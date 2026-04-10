# Reference
## Auth
<details><summary><code>client.Auth.Gettokenwithclientcredentials(request) -> *fern.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AuthGetTokenWithClientCredentialsRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        Audience: fern.AuthGetTokenWithClientCredentialsRequestAudienceHttpsApiExampleCom,
        GrantType: fern.AuthGetTokenWithClientCredentialsRequestGrantTypeClientCredentials,
    }
client.Auth.Gettokenwithclientcredentials(
        context.TODO(),
        request,
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

**audience:** `*fern.AuthGetTokenWithClientCredentialsRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `*fern.AuthGetTokenWithClientCredentialsRequestGrantType` 
    
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

<details><summary><code>client.Auth.Refreshtoken(request) -> *fern.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AuthRefreshTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        RefreshToken: "refresh_token",
        Audience: fern.AuthRefreshTokenRequestAudienceHttpsApiExampleCom,
        GrantType: fern.AuthRefreshTokenRequestGrantTypeRefreshToken,
    }
client.Auth.Refreshtoken(
        context.TODO(),
        request,
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

**refreshToken:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `*fern.AuthRefreshTokenRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `*fern.AuthRefreshTokenRequestGrantType` 
    
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

