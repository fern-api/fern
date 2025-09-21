# Reference
## Long Path
<details><summary><code>client.deepCursorPath.doThing(request) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.deepCursorPath().doThing(
    A
        .builder()
        .b(
            B
                .builder()
                .c(
                    C
                        .builder()
                        .d(
                            D
                                .builder()
                                .startingAfter("starting_after")
                                .build()
                        )
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

**request:** `A` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.deepCursorPath.doThingRequired(request) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.deepCursorPath().doThingRequired(
    MainRequired
        .builder()
        .indirection(
            IndirectionRequired
                .builder()
                .results(
                    new ArrayList<String>(
                        Arrays.asList("results", "results")
                    )
                )
                .startingAfter("starting_after")
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

**request:** `MainRequired` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.deepCursorPath.doThingInline(request) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.deepCursorPath().doThingInline(
    InlineA
        .builder()
        .b(
            InlineB
                .builder()
                .c(
                    InlineC
                        .builder()
                        .b(
                            InlineD
                                .builder()
                                .startingAfter("starting_after")
                                .build()
                        )
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

**request:** `InlineA` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
