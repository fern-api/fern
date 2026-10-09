# Reference
## Authorization
<details><summary><code>client.authorization.createToken(request) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.authorization().createToken(
    TokenRequest
        .builder()
        .grantType(TokenRequestGrantType.CLIENT_CREDENTIALS)
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

**grantType:** `TokenRequestGrantType` 
    
</dd>
</dl>

<dl>
<dd>

**clientId:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Plants
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

