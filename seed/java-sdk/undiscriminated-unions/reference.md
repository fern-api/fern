# Reference
## Union
<details><summary><code>client.union.get(request) -> MyUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.union().get(
    MyUnion.of("string")
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

**request:** `MyUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.getmetadata() -> Map&amp;lt;String, String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.union().getmetadata();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.updatemetadata(request) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.union().updatemetadata(
    MetadataUnion.of(
        Optional.of(
            new HashMap<String, Object>() {{
                put("key", "value");
            }}
        )
    )
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

**request:** `MetadataUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.call(request) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.union().call(
    Request
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

**union:** `Optional<MetadataUnion>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.duplicatetypesunion(request) -> UnionWithDuplicateTypes</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.union().duplicatetypesunion(
    UnionWithDuplicateTypes.of("string")
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

**request:** `UnionWithDuplicateTypes` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.nestedunions(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.union().nestedunions(
    NestedUnionRoot.of("string")
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

**request:** `NestedUnionRoot` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.testcamelcaseproperties(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.union().testcamelcaseproperties(
    UnionTestCamelCasePropertiesRequest
        .builder()
        .paymentMethod(
            PaymentMethodUnion.of(
                TokenizeCard
                    .builder()
                    .method("method")
                    .cardNumber("cardNumber")
                    .build()
            )
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

**paymentMethod:** `PaymentMethodUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

