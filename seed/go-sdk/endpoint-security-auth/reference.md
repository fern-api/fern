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
request := &fern.GetTokenRequest{
        ClientId: "client_id",
        ClientSecret: "client_secret",
        Scope: fern.String(
            "scope",
        ),
    }
client.Auth.GetToken(
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

## User
<details><summary><code>client.User.GetWithBearer() -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.User.GetWithBearer(
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

<details><summary><code>client.User.GetWithApiKey() -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.User.GetWithBearer(
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

<details><summary><code>client.User.GetWithOAuth() -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.User.GetWithBearer(
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

<details><summary><code>client.User.GetWithAnyAuth() -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.User.GetWithBearer(
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

<details><summary><code>client.User.GetWithAllAuth() -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.User.GetWithBearer(
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
