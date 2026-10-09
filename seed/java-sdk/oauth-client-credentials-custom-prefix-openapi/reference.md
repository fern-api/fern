# Reference
## Identity
<details><summary><code>client.identity.getToken(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.identity().getToken(
    GetTokenIdentityRequest
        .builder()
        .username("username")
        .password("password")
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

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Plants
<details><summary><code>client.plants.list() -> List&amp;lt;Plant&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.plants().list();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.plants.get(plantId) -> Plant</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.plants().get(
    "plantId",
    GetPlantsRequest
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

**plantId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

