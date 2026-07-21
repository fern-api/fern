# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedApi/Auth/AuthClient.cs">GetTokenAsync</a>(GetTokenAuthRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GetTokenAsync(
    new GetTokenAuthRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        Scopes = "scopes",
        GrantType = GetTokenAuthRequestGrantType.ClientCredentials,
        Tenant = "tenant",
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

**request:** `GetTokenAuthRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Auth.<a href="/src/SeedApi/Auth/AuthClient.cs">RefreshTokenAsync</a>(RefreshTokenAuthRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.RefreshTokenAsync(
    new RefreshTokenAuthRequest
    {
        RefreshToken = "refresh_token",
        GrantType = RefreshTokenAuthRequestGrantType.RefreshToken,
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

**request:** `RefreshTokenAuthRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## System
<details><summary><code>client.System.<a href="/src/SeedApi/System/SystemClient.cs">HealthAsync</a>() -> WithRawResponseTask</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.HealthAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Pets
<details><summary><code>client.Pets.<a href="/src/SeedApi/Pets/PetsClient.cs">ListAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;string&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Pets.ListAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

