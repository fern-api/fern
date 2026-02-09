# Reference
<details><summary><code>client.<a href="/src/Client.ts">getUsers</a>() -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.getUsers();

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

**requestOptions:** `SeedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/Client.ts">getUser</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.getUser({
    userId: "userId"
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

**request:** `SeedApi.GetUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/Client.ts">getToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.getToken({
    client_id: "client_id",
    client_secret: "client_secret"
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

**request:** `SeedApi.TokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
