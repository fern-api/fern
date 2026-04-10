# Reference
## Headers
<details><summary><code>client.Headers.<a href="/src/SeedApi/Headers/HeadersClient.cs">SendAsync</a>(HeadersSendRequest { ... }) -> WithRawResponseTask&lt;SendResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Headers.SendAsync(
    new HeadersSendRequest
    {
        EndpointVersion = HeadersSendRequestXEndpointVersion.Two122024,
        Async = true,
        Query = "query",
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

**request:** `HeadersSendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>client.Inlined.<a href="/src/SeedApi/Inlined/InlinedClient.cs">SendAsync</a>(InlinedSendRequest { ... }) -> WithRawResponseTask&lt;SendResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Inlined.SendAsync(
    new InlinedSendRequest
    {
        Prompt = InlinedSendRequestPrompt.YouAreAHelpfulAssistant,
        Query = "query",
        Stream = true,
        AliasedContext = SomeAliasedLiteral.YoureSuperWise,
        ObjectWithLiteral = new ATopLevelLiteral
        {
            NestedLiteral = new ANestedLiteral { MyLiteral = ANestedLiteralMyLiteral.HowSuperCool },
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

**request:** `InlinedSendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.Path.<a href="/src/SeedApi/Path/PathClient.cs">SendAsync</a>(PathSendRequest { ... }) -> WithRawResponseTask&lt;SendResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Path.SendAsync(new PathSendRequest { Id = PathSendRequestId.OneHundredTwentyThree });
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

**request:** `PathSendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.Query.<a href="/src/SeedApi/Query/QueryClient.cs">SendAsync</a>(QuerySendRequest { ... }) -> WithRawResponseTask&lt;SendResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Query.SendAsync(
    new QuerySendRequest
    {
        Prompt = QuerySendRequestPrompt.YouAreAHelpfulAssistant,
        AliasPrompt = AliasToPrompt.YouAreAHelpfulAssistant,
        Query = "query",
        Stream = true,
        AliasStream = true,
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

**request:** `QuerySendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
<details><summary><code>client.Reference.<a href="/src/SeedApi/Reference/ReferenceClient.cs">SendAsync</a>(SendRequest { ... }) -> WithRawResponseTask&lt;SendResponse&gt;</code></summary>
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
        Prompt = SendRequestPrompt.YouAreAHelpfulAssistant,
        Query = "query",
        Stream = true,
        Ending = SendRequestEnding.Ending,
        Context = SomeLiteral.YoureSuperWise,
        ContainerObject = new ContainerObject
        {
            NestedObjects = new List<NestedObjectWithLiterals>()
            {
                new NestedObjectWithLiterals
                {
                    Literal1 = NestedObjectWithLiteralsLiteral1.Literal1,
                    Literal2 = NestedObjectWithLiteralsLiteral2.Literal2,
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

