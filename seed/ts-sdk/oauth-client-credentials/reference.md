# Reference

## Auth

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
    client_id: "client_id",
    client_secret: "client_secret",
    scope: "scope",
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

**requestOptions:** `Auth.RequestOptions`

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
    client_id: "client_id",
    client_secret: "client_secret",
    refresh_token: "refresh_token",
    scope: "scope",
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

**requestOptions:** `Auth.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Simple

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

**requestOptions:** `Simple.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
