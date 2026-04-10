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
request := &fern.BootInstanceRequest{
        Size: "size",
    }
client.Ec2.BootInstance(
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
<details><summary><code>client.S3.GetPresignedURL(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetPresignedURLRequest{
        S3Key: "s3Key",
    }
client.S3.GetPresignedURL(
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

