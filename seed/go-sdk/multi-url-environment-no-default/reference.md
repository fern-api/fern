# Reference
## Ec2
<details><summary><code>client.Ec2.BootInstance(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Ec2.BootInstance(
        context.TODO(),
        &fern.BootInstanceRequest{
            Size: "size",
        },
    )
}
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

**size:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## S3
<details><summary><code>client.S3.GetPresignedUrl(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.S3.GetPresignedUrl(
        context.TODO(),
        &fern.GetPresignedUrlRequest{
            S3Key: "s3Key",
        },
    )
}
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

**s3Key:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
