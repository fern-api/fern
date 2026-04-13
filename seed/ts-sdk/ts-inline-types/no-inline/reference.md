# Reference
## 
<details><summary><code>client..<a href="/src/api/resources/client/Client.ts">getRoot</a>({ ...params }) -> SeedApi.RootType1</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client..getRoot({
    bar: {
        foo: "foo"
    },
    foo: "foo"
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

**request:** `SeedApi.GetRootRequest` 
    
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

<details><summary><code>client..<a href="/src/api/resources/client/Client.ts">getDiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client..getDiscriminatedUnion({
    bar: {
        foo: "foo",
        bar: {
            foo: "foo",
            ref: {
                foo: "foo"
            }
        },
        ref: {
            foo: "foo"
        },
        type: "type1"
    },
    foo: "foo"
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

**request:** `SeedApi.GetDiscriminatedUnionRequest` 
    
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

<details><summary><code>client..<a href="/src/api/resources/client/Client.ts">getUndiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client..getUndiscriminatedUnion({
    bar: "SUNNY",
    foo: "foo"
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

**request:** `SeedApi.GetUndiscriminatedUnionRequest` 
    
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

