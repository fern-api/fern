# Reference
## Service
<details><summary><code>client.service.createsimple(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createsimple(
    SimpleStaged
        .builder()
        .first("first")
        .second("second")
        .third("third")
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

**request:** `SimpleStaged` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createmedium(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createmedium(
    MediumStaged
        .builder()
        .alpha("alpha")
        .beta(1)
        .gamma("gamma")
        .delta(true)
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

**alpha:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**beta:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**gamma:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**delta:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**optional:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createcomplex(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createcomplex(
    ComplexStaged
        .builder()
        .fieldA("fieldA")
        .fieldB(1)
        .fieldC(true)
        .fieldD("fieldD")
        .fieldE(1.1)
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

**fieldA:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fieldB:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**fieldC:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**fieldD:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fieldE:** `Double` 
    
</dd>
</dl>

<dl>
<dd>

**optionalX:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**optionalY:** `Optional<Integer>` 
    
</dd>
</dl>

<dl>
<dd>

**optionalZ:** `Optional<Boolean>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createmixed(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createmixed(
    MixedStaged
        .builder()
        .id("id")
        .name("name")
        .timestamp(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .nested(
            SimpleStaged
                .builder()
                .first("first")
                .second("second")
                .third("third")
                .build()
        )
        .count(1)
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

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**timestamp:** `OffsetDateTime` 
    
</dd>
</dl>

<dl>
<dd>

**nested:** `SimpleStaged` 
    
</dd>
</dl>

<dl>
<dd>

**count:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createparent(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createparent(
    Parent
        .builder()
        .parentId("parentId")
        .child(
            Child
                .builder()
                .childId("childId")
                .childValue(1)
                .build()
        )
        .parentName("parentName")
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

**parentId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**child:** `Child` 
    
</dd>
</dl>

<dl>
<dd>

**parentName:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

