# Reference
## Bigunion
<details><summary><code>client.bigunion.get(id) -> BigUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.bigunion().get(
    "id",
    BigunionGetRequest
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

**id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bigunion.update(request) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.bigunion().update(
    BigUnion.of(
        BigUnionZero
            .builder()
            .value("value")
            .type(BigUnionZeroType.NORMAL_SWEET)
            .build()
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

**request:** `BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bigunion.updateMany(request) -> Map&amp;lt;String, Boolean&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.bigunion().updateMany(
    Arrays.asList(
        BigUnion.of(
            BigUnionZero
                .builder()
                .value("value")
                .type(BigUnionZeroType.NORMAL_SWEET)
                .build()
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

**request:** `List<BigUnion>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Types
<details><summary><code>client.types.get(id) -> UnionWithTime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.types().get(
    "id",
    TypesGetRequest
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

**id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.types.update(request) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.types().update(
    UnionWithTime.value(
        UnionWithTimeValue
            .builder()
            .build()
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

**request:** `UnionWithTime` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.union.get(id) -> Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.union().get(
    "id",
    UnionGetRequest
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

**id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.update(request) -> Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.union().update(
    Shape.of(
        ShapeZero
            .builder()
            .radius(1.1)
            .type(ShapeZeroType.CIRCLE)
            .build()
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

**request:** `Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

