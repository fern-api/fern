# Reference
<details><summary><code>client.<a href="/src/SeedObject/SeedObjectClient.cs">GetRootAsync</a>(PostRootRequest { ... }) -> WithRawResponseTask&lt;RootType1&gt;</code></summary>
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
        Bar = new RequestTypeInlineType1 { Foo = "foo" },
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

<details><summary><code>client.<a href="/src/SeedObject/SeedObjectClient.cs">GetDiscriminatedUnionAsync</a>(GetDiscriminatedUnionRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetDiscriminatedUnionAsync(
    new GetDiscriminatedUnionRequest
    {
        Bar = new DiscriminatedUnion1(
            new DiscriminatedUnion1.Type1(
                new DiscriminatedUnion1InlineType1
                {
                    Foo = "foo",
                    Bar = new DiscriminatedUnion1InlineType1InlineType1
                    {
                        Foo = "foo",
                        Ref = new ReferenceType { Foo = "foo" },
                    },
                    Ref = new ReferenceType { Foo = "foo" },
                }
            )
        ),
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

**request:** `GetDiscriminatedUnionRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedObject/SeedObjectClient.cs">GetUndiscriminatedUnionAsync</a>(GetUndiscriminatedUnionRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetUndiscriminatedUnionAsync(
    new GetUndiscriminatedUnionRequest
    {
        Bar = new UndiscriminatedUnion1InlineType1
        {
            Foo = "foo",
            Bar = new UndiscriminatedUnion1InlineType1InlineType1
            {
                Foo = "foo",
                Ref = new ReferenceType { Foo = "foo" },
            },
            Ref = new ReferenceType { Foo = "foo" },
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

**request:** `GetUndiscriminatedUnionRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

