# Reference
## auth
<details><summary><code>client.auth.<a href="/src/api/resources/auth/client/Client.ts">getTokenWithClientCredentials</a>({ ...params }) -> SeedOauthClientCredentials.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.auth.getTokenWithClientCredentials({
    clientId: "my_oauth_app_123",
    clientSecret: "sk_live_abcdef123456789",
    scope: "read:users"
});

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

**request:** `SeedOauthClientCredentials.GetTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.<a href="/src/api/resources/auth/client/Client.ts">refreshToken</a>({ ...params }) -> SeedOauthClientCredentials.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.auth.refreshToken({
    clientId: "my_oauth_app_123",
    clientSecret: "sk_live_abcdef123456789",
    refreshToken: "refresh_token",
    scope: "read:users"
});

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

**request:** `SeedOauthClientCredentials.RefreshTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## nestedNoAuth.api
<details><summary><code>client.nestedNoAuth.api.<a href="/src/api/resources/nestedNoAuth/resources/api/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nestedNoAuth.api.getSomething();

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

**requestOptions:** `ApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## nested.api
<details><summary><code>client.nested.api.<a href="/src/api/resources/nested/resources/api/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nested.api.getSomething();

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

**requestOptions:** `ApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## simple
<details><summary><code>client.simple.<a href="/src/api/resources/simple/client/Client.ts">getSomething</a>() -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.simple.getSomething();

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

**requestOptions:** `SimpleClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
