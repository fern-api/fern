# Reference
## Service
<details><summary><code>client.service.getresource(resourceId) -> Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().getresource(
    "ResourceID",
    ServiceGetResourceRequest
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

**resourceId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.listresources() -> List&amp;lt;Resource&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().listresources(
    ServiceListResourcesRequest
        .builder()
        .pageLimit(1)
        .beforeDate("2023-01-15")
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

