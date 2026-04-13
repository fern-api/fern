# Reference
## Ec2
<details><summary><code>$client-&gt;ec2-&gt;bootinstance($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->ec2->bootinstance(
    new Ec2BootInstanceRequest([
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
<details><summary><code>$client-&gt;s3-&gt;getpresignedurl($request) -> ?string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->s3->getpresignedurl(
    new S3GetPresignedUrlRequest([
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

