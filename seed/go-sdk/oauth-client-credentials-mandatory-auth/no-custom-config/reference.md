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
request := &fern.GetTokenRequest{
        ClientId: "my_oauth_app_123",
        ClientSecret: "sk_live_abcdef123456789",
        Scope: fern.String(
            "read:users",
        ),
    }
client.Auth.GetTokenWithClientCredentials(
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
request := &fern.RefreshTokenRequest{
        ClientId: "my_oauth_app_123",
        ClientSecret: "sk_live_abcdef123456789",
        RefreshToken: "refresh_token",
        Scope: fern.String(
            "read:users",
        ),
    }
client.Auth.RefreshToken(
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

## Nested Api
<details><summary><code>client.Nested.Api.GetSomething() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Nested.Api.GetSomething(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.Simple.GetSomething() -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Simple.GetSomething(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
