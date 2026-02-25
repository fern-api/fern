# Reference
## Service
<details><summary><code>client.service.createSimple(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createSimple(
    SimpleStaged
        .builder()
        .first("a")
        .second("b")
        .third("c")
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

<details><summary><code>client.service.createMedium(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createMedium(
    MediumStaged
        .builder()
        .alpha("alpha")
        .beta(1)
        .gamma("gamma")
        .delta(true)
        .optional("optional")
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

**request:** `MediumStaged` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createComplex(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createComplex(
    ComplexStaged
        .builder()
        .fieldA("a")
        .fieldB(1)
        .fieldC(true)
        .fieldD("d")
        .fieldE(1.5)
        .optionalX("x")
        .optionalY(2)
        .optionalZ(false)
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

**request:** `ComplexStaged` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createMixed(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createMixed(
    MixedStaged
        .builder()
        .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
        .name("test")
        .timestamp(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
        .nested(
            SimpleStaged
                .builder()
                .first("a")
                .second("b")
                .third("c")
                .build()
        )
        .count(42)
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

**request:** `MixedStaged` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createParent(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createParent(
    Parent
        .builder()
        .parentId("parent-123")
        .child(
            Child
                .builder()
                .childId("child-456")
                .childValue(789)
                .build()
        )
        .parentName("Parent Name")
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

**request:** `Parent` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
