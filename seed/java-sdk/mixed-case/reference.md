# Reference
## Service
<details><summary><code>client.service.getResource(resourceId) -> Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().getResource("rsc-xyz");
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

**resourceId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.listResources() -> List&lt;Resource&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().listResources(
    ListResourcesRequest
        .builder()
        .pageLimit(10)
        .beforeDate("2023-01-01")
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

**pageLimit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**beforeDate:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
