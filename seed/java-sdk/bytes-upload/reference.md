# Reference
## Service
<details><summary><code>client.service.upload(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().upload("".getBytes());
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.uploadWithQueryParams(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().uploadWithQueryParams(
    UploadWithQueryParamsRequest
        .builder()
        .model("nova-2")
        .body("".getBytes())
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

**model:** `String` — The model to use for processing
    
</dd>
</dl>

<dl>
<dd>

**language:** `Optional<String>` — The language of the content
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

