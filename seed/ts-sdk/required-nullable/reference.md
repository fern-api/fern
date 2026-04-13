# Reference
## 
<details><summary><code>client..<a href="/src/api/resources/client/Client.ts">getFoo</a>({ ...params }) -> SeedApi.Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client..getFoo({
    required_baz: "required_baz",
    required_nullable_baz: "required_nullable_baz"
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

**request:** `SeedApi.GetFooRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client..<a href="/src/api/resources/client/Client.ts">updateFoo</a>({ ...params }) -> SeedApi.Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client..updateFoo({
    "X-Idempotency-Key": "X-Idempotency-Key",
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

**request:** `SeedApi.UpdateFooRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Client.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

