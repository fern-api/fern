# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedOauthClientCredentialsEnvironmentVariables/Auth/AuthClient.cs">GetTokenWithClientCredentialsAsync</a>(SeedOauthClientCredentialsEnvironmentVariables.GetTokenRequest { ... }) -> SeedOauthClientCredentialsEnvironmentVariables.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GetTokenWithClientCredentialsAsync(
    new SeedOauthClientCredentialsEnvironmentVariables.GetTokenRequest
    {
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

**request:** `SeedOauthClientCredentialsEnvironmentVariables.GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Auth.<a href="/src/SeedOauthClientCredentialsEnvironmentVariables/Auth/AuthClient.cs">RefreshTokenAsync</a>(SeedOauthClientCredentialsEnvironmentVariables.RefreshTokenRequest { ... }) -> SeedOauthClientCredentialsEnvironmentVariables.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.RefreshTokenAsync(
    new SeedOauthClientCredentialsEnvironmentVariables.RefreshTokenRequest
    {
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

**request:** `SeedOauthClientCredentialsEnvironmentVariables.RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuth Api
<details><summary><code>client.NestedNoAuth.Api.<a href="/src/SeedOauthClientCredentialsEnvironmentVariables/NestedNoAuth/Api/ApiClient.cs">GetSomethingAsync</a>()</code></summary>
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
<details><summary><code>client.Nested.Api.<a href="/src/SeedOauthClientCredentialsEnvironmentVariables/Nested/Api/ApiClient.cs">GetSomethingAsync</a>()</code></summary>
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
<details><summary><code>client.Simple.<a href="/src/SeedOauthClientCredentialsEnvironmentVariables/Simple/SimpleClient.cs">GetSomethingAsync</a>()</code></summary>
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
