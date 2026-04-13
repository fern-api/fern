# Reference
## Auth
<details><summary><code>client.Auth.<a href="/src/SeedApi/Auth/AuthClient.cs">GettokenAsync</a>(AuthGetTokenRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GettokenAsync(
    new AuthGetTokenRequest
    {
        ClientId = "client_id",
        ClientSecret = "client_secret",
        Audience = AuthGetTokenRequestAudience.HttpsApiExampleCom,
        GrantType = AuthGetTokenRequestGrantType.ClientCredentials,
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

**request:** `AuthGetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">GetAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;User&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">GetadminsAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;User&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetadminsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

