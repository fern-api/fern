# Reference
## Ec2
<details><summary><code>client.ec2.bootinstance(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.ec2().bootinstance(
    Ec2BootInstanceRequest
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
<details><summary><code>client.s3.getpresignedurl(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.s3().getpresignedurl(
    S3GetPresignedUrlRequest
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

