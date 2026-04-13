# Reference
## Auth
<details><summary><code>client.Auth.Gettoken(request) -> *fern.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AuthGetTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        Audience: fern.AuthGetTokenRequestAudienceHttpsApiExampleCom,
        GrantType: fern.AuthGetTokenRequestGrantTypeClientCredentials,
    }
client.Auth.Gettoken(
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

**audience:** `*fern.AuthGetTokenRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `*fern.AuthGetTokenRequestGrantType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.Get() -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.User.Get(
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

<details><summary><code>client.User.Getadmins() -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.User.Getadmins(
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

