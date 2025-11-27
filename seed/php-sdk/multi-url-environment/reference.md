# Reference
## Ec2
<details><summary><code>$client->ec2->bootInstance($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->ec2->bootInstance(
    new BootInstanceRequest([
        'size' => 'size',
    ]),
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

**$size:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## S3
<details><summary><code>$client->s3->getPresignedUrl($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->s3->getPresignedUrl(
    new GetPresignedUrlRequest([
        's3Key' => 's3Key',
    ]),
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

**$s3Key:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
