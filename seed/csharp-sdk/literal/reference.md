# Reference
## Headers
<details><summary><code>client.Headers.<a href="/src/SeedLiteral/Headers/HeadersClient.cs">SendAsync</a>(SeedLiteral.SendLiteralsInHeadersRequest { ... }) -> SeedLiteral.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Headers.SendAsync(
    new SeedLiteral.SendLiteralsInHeadersRequest
    {
        EndpointVersion = "02-12-2024",
        Async = true,
        Query = "What is the weather today",
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

**request:** `SeedLiteral.SendLiteralsInHeadersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>client.Inlined.<a href="/src/SeedLiteral/Inlined/InlinedClient.cs">SendAsync</a>(SeedLiteral.SendLiteralsInlinedRequest { ... }) -> SeedLiteral.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Inlined.SendAsync(
    new SeedLiteral.SendLiteralsInlinedRequest
    {
        Temperature = 10.1,
        Prompt = "You are a helpful assistant",
        Context = "You're super wise",
        AliasedContext = "You're super wise",
        MaybeContext = "You're super wise",
        ObjectWithLiteral = new SeedLiteral.ATopLevelLiteral
        {
            NestedLiteral = new SeedLiteral.ANestedLiteral { MyLiteral = "How super cool" },
        },
        Stream = false,
        Query = "What is the weather today",
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

**request:** `SeedLiteral.SendLiteralsInlinedRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.Path.<a href="/src/SeedLiteral/Path/PathClient.cs">SendAsync</a>(id) -> SeedLiteral.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Path.SendAsync("123");
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
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.Query.<a href="/src/SeedLiteral/Query/QueryClient.cs">SendAsync</a>(SeedLiteral.SendLiteralsInQueryRequest { ... }) -> SeedLiteral.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Query.SendAsync(
    new SeedLiteral.SendLiteralsInQueryRequest
    {
        Prompt = "You are a helpful assistant",
        OptionalPrompt = "You are a helpful assistant",
        AliasPrompt = "You are a helpful assistant",
        AliasOptionalPrompt = "You are a helpful assistant",
        Stream = false,
        OptionalStream = false,
        AliasStream = false,
        AliasOptionalStream = false,
        Query = "What is the weather today",
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

**request:** `SeedLiteral.SendLiteralsInQueryRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
<details><summary><code>client.Reference.<a href="/src/SeedLiteral/Reference/ReferenceClient.cs">SendAsync</a>(SeedLiteral.SendRequest { ... }) -> SeedLiteral.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Reference.SendAsync(
    new SeedLiteral.SendRequest
    {
        Prompt = "You are a helpful assistant",
        Stream = false,
        Context = "You're super wise",
        Query = "What is the weather today",
        ContainerObject = new SeedLiteral.ContainerObject
        {
            NestedObjects = new List<SeedLiteral.NestedObjectWithLiterals>()
            {
                new SeedLiteral.NestedObjectWithLiterals
                {
                    Literal1 = "literal1",
                    Literal2 = "literal2",
                    StrProp = "strProp",
                },
            },
        },
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

**request:** `SeedLiteral.SendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
