# Reference
## Headers
<details><summary><code>client.Headers.Send(request) -> *fern.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.HeadersSendRequest{
        EndpointVersion: fern.HeadersSendRequestXEndpointVersionTwo122024,
        Async: true,
        Query: "query",
    }
client.Headers.Send(
        context.TODO(),
        request,
    )
}
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

**endpointVersion:** `*fern.HeadersSendRequestXEndpointVersion` 
    
</dd>
</dl>

<dl>
<dd>

**async:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>client.Inlined.Send(request) -> *fern.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlinedSendRequest{
        Prompt: fern.InlinedSendRequestPromptYouAreAHelpfulAssistant,
        Query: "query",
        Stream: true,
        AliasedContext: fern.SomeAliasedLiteralYoureSuperWise,
        ObjectWithLiteral: &fern.ATopLevelLiteral{
            NestedLiteral: &fern.ANestedLiteral{
                MyLiteral: fern.ANestedLiteralMyLiteralHowSuperCool,
            },
        },
    }
client.Inlined.Send(
        context.TODO(),
        request,
    )
}
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

**prompt:** `*fern.InlinedSendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `*fern.InlinedSendRequestContext` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**temperature:** `*float64` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**aliasedContext:** `*fern.SomeAliasedLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**maybeContext:** `*fern.SomeAliasedLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**objectWithLiteral:** `*fern.ATopLevelLiteral` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.Path.Send(ID) -> *fern.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.PathSendRequest{
        ID: fern.PathSendRequestIDOneHundredTwentyThree.Ptr(),
    }
client.Path.Send(
        context.TODO(),
        request,
    )
}
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

**id:** `*fern.PathSendRequestID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.Query.Send() -> *fern.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.QuerySendRequest{
        Prompt: fern.QuerySendRequestPromptYouAreAHelpfulAssistant,
        AliasPrompt: fern.AliasToPromptYouAreAHelpfulAssistant,
        Query: "query",
        Stream: true,
        AliasStream: true,
    }
client.Query.Send(
        context.TODO(),
        request,
    )
}
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

**prompt:** `*fern.QuerySendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**optionalPrompt:** `*fern.QuerySendRequestOptionalPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**aliasPrompt:** `*fern.AliasToPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**aliasOptionalPrompt:** `*fern.AliasToPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**optionalStream:** `*bool` 
    
</dd>
</dl>

<dl>
<dd>

**aliasStream:** `fern.AliasToStream` 
    
</dd>
</dl>

<dl>
<dd>

**aliasOptionalStream:** `*fern.AliasToStream` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
<details><summary><code>client.Reference.Send(request) -> *fern.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SendRequest{
        Prompt: fern.SendRequestPromptYouAreAHelpfulAssistant,
        Query: "query",
        Stream: true,
        Ending: fern.SendRequestEndingEnding,
        Context: fern.SomeLiteralYoureSuperWise,
        ContainerObject: &fern.ContainerObject{
            NestedObjects: []*fern.NestedObjectWithLiterals{
                &fern.NestedObjectWithLiterals{
                    Literal1: fern.NestedObjectWithLiteralsLiteral1Literal1,
                    Literal2: fern.NestedObjectWithLiteralsLiteral2Literal2,
                    StrProp: "strProp",
                },
            },
        },
    }
client.Reference.Send(
        context.TODO(),
        request,
    )
}
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

**prompt:** `*fern.SendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**ending:** `*fern.SendRequestEnding` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `*fern.SomeLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**maybeContext:** `*fern.SomeLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**containerObject:** `*fern.ContainerObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

