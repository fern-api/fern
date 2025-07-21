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
    SendLiteralsInHeadersRequest
        .builder()
        .endpointVersion("02-12-2024")
        .async(true)
        .query("What is the weather today")
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

**endpointVersion:** `String` 
    
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
    SendLiteralsInlinedRequest
        .builder()
        .prompt("You are a helpful assistant")
        .aliasedContext("You're super wise")
        .objectWithLiteral(
            ATopLevelLiteral
                .builder()
                .nestedLiteral(
                    ANestedLiteral
                        .builder()
                        .myLiteral("How super cool")
                        .build()
                )
                .build()
        )
        .stream(false)
        .query("What is the weather today")
        .temperature(10.1)
        .context("You're super wise")
        .maybeContext("You're super wise")
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

**prompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**temperature:** `Optional<Float>` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**aliasedContext:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**maybeContext:** `Optional<String>` 
    
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
client.path().send("123");
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

**id:** `String` 
    
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
    SendLiteralsInQueryRequest
        .builder()
        .prompt("You are a helpful assistant")
        .aliasPrompt("You are a helpful assistant")
        .stream(false)
        .aliasStream(false)
        .query("What is the weather today")
        .optionalPrompt("You are a helpful assistant")
        .aliasOptionalPrompt("You are a helpful assistant")
        .optionalStream(false)
        .aliasOptionalStream(false)
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

**prompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optionalPrompt:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**aliasPrompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**aliasOptionalPrompt:** `Optional<String>` 
    
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
        .prompt("You are a helpful assistant")
        .stream(false)
        .context("You're super wise")
        .query("What is the weather today")
        .containerObject(
            ContainerObject
                .builder()
                .nestedObjects(
                    new ArrayList<NestedObjectWithLiterals>(
                        Arrays.asList(
                            NestedObjectWithLiterals
                                .builder()
                                .literal1("literal1")
                                .literal2("literal2")
                                .strProp("strProp")
                                .build()
                        )
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

**request:** `SendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
