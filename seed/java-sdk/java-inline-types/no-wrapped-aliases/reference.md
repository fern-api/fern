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
            PostRootRequest.Bar
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
            GetDiscriminatedUnionRequest.Bar.type1(
                GetDiscriminatedUnionRequest.Bar.Type1
                    .builder()
                    .foo("foo")
                    .bar(
                        GetDiscriminatedUnionRequest.Bar.Type1.Bar_
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
            GetUndiscriminatedUnionRequest.Bar.of(
                GetUndiscriminatedUnionRequest.Bar.InlineType1
                    .builder()
                    .foo("foo")
                    .bar(
                        GetUndiscriminatedUnionRequest.Bar.InlineType1.Bar_
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

<details><summary><code>client.getMapResponse() -> Map&amp;lt;String, MapResponseValue&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getMapResponse();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.getSharedChild() -> SharedChildType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getSharedChild();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.getOrphanParent() -> OrphanParentWithSharedChild</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getOrphanParent();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

