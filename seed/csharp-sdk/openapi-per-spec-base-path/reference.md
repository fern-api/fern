# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">ListItemsAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;string&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.ListItemsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Oauth
<details><summary><code>client.Oauth.<a href="/src/SeedApi/Oauth/OauthClient.cs">GetTokenAsync</a>(GetTokenRequest { ... }) -> WithRawResponseTask&lt;GetTokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Oauth.GetTokenAsync(
    new GetTokenRequest { ClientId = "client_id", ClientSecret = "client_secret" }
);
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

**request:** `GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

