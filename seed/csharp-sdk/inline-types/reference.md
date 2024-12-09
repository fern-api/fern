# Reference
<details><summary><code>client.<a href="/src/SeedObject/SeedObjectClient.cs">GetRootAsync</a>(PostRootRequest { ... }) -> RootType1</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetRootAsync(
    new PostRootRequest
    {
        Bar = new InlineType1
        {
            Foo = "foo",
            Bar = new NestedInlineType1
            {
                Foo = "foo",
                Bar = "bar",
                MyEnum = InlineEnum.Sunny,
            },
        },
        Foo = "foo",
    }
);
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

**request:** `PostRootRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
