# Reference
<details><summary><code>client.getRoot(request) -> RootType1</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getRoot(
    PostRootRequest
        .builder()
        .bar(
            RequestTypeInlineType1
                .builder()
                .foo("foo")
                .build()
        )
        .foo("foo")
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

**bar:** `RequestTypeInlineType1` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.getDiscriminatedUnion(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getDiscriminatedUnion(
    GetDiscriminatedUnionRequest
        .builder()
        .bar(
            DiscriminatedUnion1.type1(
                DiscriminatedUnion1InlineType1
                    .builder()
                    .foo("foo")
                    .bar(
                        DiscriminatedUnion1InlineType1InlineType1
                            .builder()
                            .foo("foo")
                            .ref(
                                ReferenceType
                                    .builder()
                                    .foo("foo")
                                    .build()
                            )
                            .build()
                    )
                    .ref(
                        ReferenceType
                            .builder()
                            .foo("foo")
                            .build()
                    )
                    .build()
            )
        )
        .foo("foo")
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

**bar:** `DiscriminatedUnion1` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.getUndiscriminatedUnion(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getUndiscriminatedUnion(
    GetUndiscriminatedUnionRequest
        .builder()
        .bar(
            UndiscriminatedUnion1.ofUndiscriminatedUnion1InlineType1(
                UndiscriminatedUnion1InlineType1
                    .builder()
                    .foo("foo")
                    .bar(
                        UndiscriminatedUnion1InlineType1InlineType1
                            .builder()
                            .foo("foo")
                            .ref(
                                ReferenceType
                                    .builder()
                                    .foo("foo")
                                    .build()
                            )
                            .build()
                    )
                    .ref(
                        ReferenceType
                            .builder()
                            .foo("foo")
                            .build()
                    )
                    .build()
            )
        )
        .foo("foo")
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

**bar:** `UndiscriminatedUnion1` 
    
</dd>
</dl>

<dl>
<dd>

**foo:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
