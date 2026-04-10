# Reference
## Headers
<details><summary><code>client.headers.send(request) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.headers().send(
    HeadersSendRequest
        .builder()
        .endpointVersion(HeadersSendRequestXEndpointVersion.TWO122024)
        .async(true)
        .query("query")
        .build()
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

**endpointVersion:** `HeadersSendRequestXEndpointVersion` 
    
</dd>
</dl>

<dl>
<dd>

**async:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>client.inlined.send(request) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlined().send(
    InlinedSendRequest
        .builder()
        .prompt(InlinedSendRequestPrompt.YOU_ARE_A_HELPFUL_ASSISTANT)
        .query("query")
        .stream(true)
        .aliasedContext(SomeAliasedLiteral.YOURE_SUPER_WISE)
        .objectWithLiteral(
            ATopLevelLiteral
                .builder()
                .nestedLiteral(
                    ANestedLiteral
                        .builder()
                        .myLiteral(ANestedLiteralMyLiteral.HOW_SUPER_COOL)
                        .build()
                )
                .build()
        )
        .build()
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

**prompt:** `InlinedSendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `Optional<InlinedSendRequestContext>` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**temperature:** `Optional<Double>` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**aliasedContext:** `SomeAliasedLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**maybeContext:** `Optional<SomeAliasedLiteral>` 
    
</dd>
</dl>

<dl>
<dd>

**objectWithLiteral:** `ATopLevelLiteral` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.path.send(id) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.path().send(
    PathSendRequestId.ONE_HUNDRED_TWENTY_THREE,
    PathSendRequest
        .builder()
        .build()
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

**id:** `PathSendRequestId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.query.send() -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.query().send(
    QuerySendRequest
        .builder()
        .prompt(QuerySendRequestPrompt.YOU_ARE_A_HELPFUL_ASSISTANT)
        .aliasPrompt(AliasToPrompt.YOU_ARE_A_HELPFUL_ASSISTANT)
        .query("query")
        .stream(true)
        .aliasStream(true)
        .build()
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

**prompt:** `QuerySendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**optionalPrompt:** `Optional<QuerySendRequestOptionalPrompt>` 
    
</dd>
</dl>

<dl>
<dd>

**aliasPrompt:** `AliasToPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**aliasOptionalPrompt:** `Optional<AliasToPrompt>` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**optionalStream:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**aliasStream:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**aliasOptionalStream:** `Optional<Boolean>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
<details><summary><code>client.reference.send(request) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.reference().send(
    SendRequest
        .builder()
        .prompt(SendRequestPrompt.YOU_ARE_A_HELPFUL_ASSISTANT)
        .query("query")
        .stream(true)
        .ending(SendRequestEnding.ENDING)
        .context(SomeLiteral.YOURE_SUPER_WISE)
        .containerObject(
            ContainerObject
                .builder()
                .nestedObjects(
                    Arrays.asList(
                        NestedObjectWithLiterals
                            .builder()
                            .literal1(NestedObjectWithLiteralsLiteral1.LITERAL1)
                            .literal2(NestedObjectWithLiteralsLiteral2.LITERAL2)
                            .strProp("strProp")
                            .build()
                    )
                )
                .build()
        )
        .build()
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

**prompt:** `SendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**ending:** `SendRequestEnding` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `SomeLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**maybeContext:** `Optional<SomeLiteral>` 
    
</dd>
</dl>

<dl>
<dd>

**containerObject:** `ContainerObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

