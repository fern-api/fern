# Reference
## Ec2
<details><summary><code>client.Ec2.Bootinstance(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.Ec2BootInstanceRequest{
        Size: "size",
    }
client.Ec2.Bootinstance(
        context.TODO(),
        request,
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
<details><summary><code>client.S3.Getpresignedurl(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.S3GetPresignedURLRequest{
        S3Key: "s3Key",
    }
client.S3.Getpresignedurl(
        context.TODO(),
        request,
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

