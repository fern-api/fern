# Reference
## Identity
<details><summary><code>client.identity.<a href="/src/api/resources/identity/client/Client.ts">getToken</a>({ ...params }) -> SeedApi.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.identity.getToken({
    username: "username",
    password: "password"
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

**request:** `SeedApi.GetTokenIdentityRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `IdentityClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Plants
<details><summary><code>client.plants.<a href="/src/api/resources/plants/client/Client.ts">list</a>() -> SeedApi.Plant[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.plants.list();

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

**requestOptions:** `PlantsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.plants.<a href="/src/api/resources/plants/client/Client.ts">get</a>({ ...params }) -> SeedApi.Plant</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.plants.get({
    plantId: "plantId"
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

**request:** `SeedApi.GetPlantsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PlantsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

