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
    require_auth: true,
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

**request:** `SeedContentTypes.PatchProxyRequest`

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

Update with JSON merge patch - complex types

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
    email: "email",
    age: 1,
    active: true,
    metadata: {
        metadata: {
            key: "value",
        },
    },
    tags: ["tags", "tags"],
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

**request:** `SeedContentTypes.PatchComplexRequest`

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
    field2: 1,
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

**request:** `SeedContentTypes.RegularPatchRequest`

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
