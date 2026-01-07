# Reference
<details><summary><code>client.<a href="/src/Client.ts">getUser</a>(id) -> SeedTsPassthroughExtraProperties.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.getUser("user-123");

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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedTsPassthroughExtraPropertiesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/Client.ts">createUser</a>({ ...params }) -> SeedTsPassthroughExtraProperties.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.createUser({
    userName: "alice",
    createdAt: new Date("2024-01-01T00:00:00.000Z")
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

**request:** `SeedTsPassthroughExtraProperties.CreateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedTsPassthroughExtraPropertiesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
