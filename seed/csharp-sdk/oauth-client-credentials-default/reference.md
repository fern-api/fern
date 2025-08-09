# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedOauthClientCredentialsDefault/Auth/AuthClient.cs">GetTokenAsync</a>(SeedOauthClientCredentialsDefault.GetTokenRequest { ... }) -> SeedOauthClientCredentialsDefault.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GetTokenAsync(
    new SeedOauthClientCredentialsDefault.GetTokenRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        GrantType = "client_credentials",
    }
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

**request:** `SeedOauthClientCredentialsDefault.GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuth Api
<details><summary><code>client.NestedNoAuth.Api.<a href="/src/SeedOauthClientCredentialsDefault/NestedNoAuth/Api/ApiClient.cs">GetSomethingAsync</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.NestedNoAuth.Api.GetSomethingAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Nested Api
<details><summary><code>client.Nested.Api.<a href="/src/SeedOauthClientCredentialsDefault/Nested/Api/ApiClient.cs">GetSomethingAsync</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Nested.Api.GetSomethingAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.Simple.<a href="/src/SeedOauthClientCredentialsDefault/Simple/SimpleClient.cs">GetSomethingAsync</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Simple.GetSomethingAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
