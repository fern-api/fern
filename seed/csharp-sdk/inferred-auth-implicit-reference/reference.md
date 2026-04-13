# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedApi/Auth/AuthClient.cs">GettokenwithclientcredentialsAsync</a>(GetTokenRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GettokenwithclientcredentialsAsync(
    new GetTokenRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        Audience = GetTokenRequestAudience.HttpsApiExampleCom,
        GrantType = GetTokenRequestGrantType.ClientCredentials,
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

**request:** `GetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Auth.<a href="/src/SeedApi/Auth/AuthClient.cs">RefreshtokenAsync</a>(RefreshTokenRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.RefreshtokenAsync(
    new RefreshTokenRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        RefreshToken = "refresh_token",
        Audience = RefreshTokenRequestAudience.HttpsApiExampleCom,
        GrantType = RefreshTokenRequestGrantType.RefreshToken,
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

**request:** `RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuthApi
<details><summary><code>client.NestedNoAuthApi.<a href="/src/SeedApi/NestedNoAuthApi/NestedNoAuthApiClient.cs">NestedNoAuthApiGetSomethingAsync</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.NestedNoAuthApi.NestedNoAuthApiGetSomethingAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedApi
<details><summary><code>client.NestedApi.<a href="/src/SeedApi/NestedApi/NestedApiClient.cs">NestedApiGetSomethingAsync</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.NestedApi.NestedApiGetSomethingAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.Simple.<a href="/src/SeedApi/Simple/SimpleClient.cs">GetsomethingAsync</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Simple.GetsomethingAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

