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
    clientId: "client_id",
    clientSecret: "client_secret",
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
    clientId: "client_id",
    clientSecret: "client_secret",
    refreshToken: "refresh_token",
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
