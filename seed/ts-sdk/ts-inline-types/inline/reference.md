# Reference
<details><summary><code>client.<a href="/src/Client.ts">getRoot</a>({ ...params }) -> SeedObject.RootType1</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.getRoot({
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

**request:** `SeedObject.PostRootRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/Client.ts">getDiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.getDiscriminatedUnion({
    bar: {
        type: "type1",
        foo: "foo",
        bar: {
            foo: "foo",
            ref: {
                foo: "foo"
            }
        },
        ref: {
            foo: "foo"
        }
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

**request:** `SeedObject.GetDiscriminatedUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/Client.ts">getUndiscriminatedUnion</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.getUndiscriminatedUnion({
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
        }
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

**request:** `SeedObject.GetUndiscriminatedUnionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
