# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedInferredAuthImplicitNoExpiry/Auth/AuthClient.cs">GetTokenWithClientCredentialsAsync</a>(SeedInferredAuthImplicitNoExpiry.GetTokenRequest { ... }) -> SeedInferredAuthImplicitNoExpiry.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GetTokenWithClientCredentialsAsync(
    new SeedInferredAuthImplicitNoExpiry.GetTokenRequest
    {
        XApiKey = "X-Api-Key",
        ClientId = "client_id",
        ClientSecret = "client_secret",
        Audience = "https://api.example.com",
        GrantType = "client_credentials",
        Scope = "scope",
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

**request:** `SeedInferredAuthImplicitNoExpiry.GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Auth.<a href="/src/SeedInferredAuthImplicitNoExpiry/Auth/AuthClient.cs">RefreshTokenAsync</a>(SeedInferredAuthImplicitNoExpiry.RefreshTokenRequest { ... }) -> SeedInferredAuthImplicitNoExpiry.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.RefreshTokenAsync(
    new SeedInferredAuthImplicitNoExpiry.RefreshTokenRequest
    {
        XApiKey = "X-Api-Key",
        ClientId = "client_id",
        ClientSecret = "client_secret",
        RefreshToken = "refresh_token",
        Audience = "https://api.example.com",
        GrantType = "refresh_token",
        Scope = "scope",
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

**request:** `SeedInferredAuthImplicitNoExpiry.RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuth Api
<details><summary><code>client.NestedNoAuth.Api.<a href="/src/SeedInferredAuthImplicitNoExpiry/NestedNoAuth/Api/ApiClient.cs">GetSomethingAsync</a>()</code></summary>
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
<details><summary><code>client.Nested.Api.<a href="/src/SeedInferredAuthImplicitNoExpiry/Nested/Api/ApiClient.cs">GetSomethingAsync</a>()</code></summary>
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
<details><summary><code>client.Simple.<a href="/src/SeedInferredAuthImplicitNoExpiry/Simple/SimpleClient.cs">GetSomethingAsync</a>()</code></summary>
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
