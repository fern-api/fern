# Reference
## Optional
<details><summary><code>client.optional.<a href="/src/api/resources/optional/client/Client.ts">sendOptionalBody</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.optional.sendOptionalBody({
    "string": {
        "key": "value"
    }
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

**request:** `Record<string, unknown>` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Optional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.<a href="/src/api/resources/optional/client/Client.ts">sendOptionalTypedBody</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.optional.sendOptionalTypedBody({
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

**request:** `SeedObjectsWithImports.SendOptionalBodyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Optional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.<a href="/src/api/resources/optional/client/Client.ts">sendOptionalNullableWithAllOptionalProperties</a>(actionId, id, { ...params }) -> SeedObjectsWithImports.DeployResponse</code></summary>
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
await client.optional.sendOptionalNullableWithAllOptionalProperties("actionId", "id", {
    updateDraft: true
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

**actionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedObjectsWithImports.DeployParams | null` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Optional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
