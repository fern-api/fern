# Reference
## Service
<details><summary><code>client.service.getWithApiKey() -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom api key
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().getWithApiKey();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.getWithHeader() -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom api key
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().getWithHeader(
    HeaderAuthRequest
        .builder()
        .xEndpointHeader("X-Endpoint-Header")
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

**xEndpointHeader:** `String` — Specifies the endpoint key.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
