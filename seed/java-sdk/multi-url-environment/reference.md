# Reference
## Ec2
<details><summary><code>client.ec2.bootInstance(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.ec2().bootInstance(
    BootInstanceRequest
        .builder()
        .size("size")
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

**size:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## S3
<details><summary><code>client.s3.getPresignedUrl(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.s3().getPresignedUrl(
    GetPresignedUrlRequest
        .builder()
        .s3Key("s3Key")
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

**s3Key:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
