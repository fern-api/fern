# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">patch</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.service.patch({
    application: "application",
    require_auth: true
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

**request:** `PatchProxyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">patchComplex</a>(id, { ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
await client.service.patchComplex("id", {
    name: "name",
    age: 1,
    active: true,
    metadata: {
        "metadata": {
            "key": "value"
        }
    },
    tags: ["tags", "tags"],
    email: "email",
    nickname: "nickname",
    bio: "bio",
    profileImageUrl: "profileImageUrl",
    settings: {
        "settings": {
            "key": "value"
        }
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `PatchComplexRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">namedPatchWithMixed</a>(id, { ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
await client.service.namedPatchWithMixed("id", {
    appId: "appId",
    instructions: "instructions",
    active: true
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `NamedMixedPatchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">optionalMergePatchTest</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
await client.service.optionalMergePatchTest({
    requiredField: "requiredField",
    optionalString: "optionalString",
    optionalInteger: 1,
    optionalBoolean: true,
    nullableString: "nullableString"
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

**request:** `OptionalMergePatchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client/Client.ts">regularPatch</a>(id, { ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
await client.service.regularPatch("id", {
    field1: "field1",
    field2: 1
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `RegularPatchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Service.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
