# Reference
## Headers
<details><summary><code>client.Headers.<a href="/src/SeedLiteral/Headers/HeadersClient.cs">SendAsync</a>(SendLiteralsInHeadersRequest { ... }) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Headers.SendAsync(
    new SendLiteralsInHeadersRequest
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

**request:** `SendLiteralsInHeadersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>client.Inlined.<a href="/src/SeedLiteral/Inlined/InlinedClient.cs">SendAsync</a>(SendLiteralsInlinedRequest { ... }) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Inlined.SendAsync(
    new SendLiteralsInlinedRequest
    {
        Temperature = 10.1,
        Prompt = "You are a helpful assistant",
        Context = "You're super wise",
        AliasedContext = "You're super wise",
        MaybeContext = "You're super wise",
        ObjectWithLiteral = new ATopLevelLiteral
        {
            NestedLiteral = new ANestedLiteral { MyLiteral = "How super cool" },
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

**request:** `SendLiteralsInlinedRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.Path.<a href="/src/SeedLiteral/Path/PathClient.cs">SendAsync</a>(id) -> SendResponse</code></summary>
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
<details><summary><code>client.Query.<a href="/src/SeedLiteral/Query/QueryClient.cs">SendAsync</a>(SendLiteralsInQueryRequest { ... }) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Query.SendAsync(
    new SendLiteralsInQueryRequest
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

**request:** `SendLiteralsInQueryRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
<details><summary><code>client.Reference.<a href="/src/SeedLiteral/Reference/ReferenceClient.cs">SendAsync</a>(SendRequest { ... }) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Reference.SendAsync(
    new SendRequest
    {
        Prompt = "You are a helpful assistant",
        Stream = false,
        Context = "You're super wise",
        Query = "What is the weather today",
        ContainerObject = new ContainerObject
        {
            NestedObjects = new List<NestedObjectWithLiterals>()
            {
                new NestedObjectWithLiterals
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

**request:** `SendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
