# Reference
## Optional
<details><summary><code>client.optional.<a href="/src/api/resources/optional/client/Client.ts">sendoptionalbody</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.optional.sendoptionalbody({
    "key": "value"
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

**request:** `Record<string, unknown> | null` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.<a href="/src/api/resources/optional/client/Client.ts">sendoptionaltypedbody</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.optional.sendoptionaltypedbody({
    message: "message"
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

**request:** `SeedApi.SendOptionalBodyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.<a href="/src/api/resources/optional/client/Client.ts">sendoptionalnullablewithalloptionalproperties</a>({ ...params }) -> SeedApi.DeployResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.optional.sendoptionalnullablewithalloptionalproperties({
    actionId: "actionId",
    id: "id"
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

**request:** `SeedApi.DeployParams` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

