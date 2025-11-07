# Reference
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

## 