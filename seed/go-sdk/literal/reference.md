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
request := &fern.SendLiteralsInHeadersRequest{
        Query: "What is the weather today",
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

**endpointVersion:** `string` 
    
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
request := &fern.SendLiteralsInlinedRequest{
        Temperature: fern.Float64(
            10.1,
        ),
        AliasedContext: fern.SomeAliasedLiteral(
            "You're super wise",
        ),
        MaybeContext: &fern.SomeAliasedLiteral(
            "You're super wise",
        ),
        ObjectWithLiteral: &fern.ATopLevelLiteral{
            NestedLiteral: &fern.ANestedLiteral{},
        },
        Query: "What is the weather today",
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

**prompt:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `*string` 
    
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

**aliasedContext:** `fern.SomeAliasedLiteral` 
    
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
<details><summary><code>client.Path.Send(Id) -> *fern.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Path.Send(
        context.TODO(),
        nil,
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

**id:** `string` 
    
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
request := &fern.SendLiteralsInQueryRequest{
        AliasPrompt: fern.AliasToPrompt(
            "You are a helpful assistant",
        ),
        AliasOptionalPrompt: &fern.AliasToPrompt(
            "You are a helpful assistant",
        ),
        AliasStream: fern.AliasToStream(
            false,
        ),
        AliasOptionalStream: &fern.AliasToStream(
            false,
        ),
        Query: "What is the weather today",
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

**prompt:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**optionalPrompt:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**aliasPrompt:** `fern.AliasToPrompt` 
    
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
        Context: fern.SomeLiteral(
            "You're super wise",
        ),
        Query: "What is the weather today",
        ContainerObject: &fern.ContainerObject{
            NestedObjects: []*fern.NestedObjectWithLiterals{
                &fern.NestedObjectWithLiterals{
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

**request:** `*fern.SendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
