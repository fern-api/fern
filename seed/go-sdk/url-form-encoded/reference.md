# Reference
<details><summary><code>client.SubmitFormData(request) -> *fern.PostSubmitResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SubmitFormDataRequest{
        Username: "johndoe",
        Email: "john@example.com",
    }
client.SubmitFormData(
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

**username:** `string` — The user's username
    
</dd>
</dl>

<dl>
<dd>

**email:** `string` — The user's email address
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.GetToken(request) -> *fern.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
    }
client.GetToken(
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

**clientID:** `string` — Client identifier
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `string` — Client secret
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

