# Reference
## FileUploadExample
<details><summary><code>$client-&gt;fileUploadExample-&gt;uploadFile($request) -> ?string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Upload a file to the database
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->fileUploadExample->uploadFile(
    new UploadFileRequest([
        'file' => File::createFromString("example_file", "example_file"),
        'name' => 'name',
    ]),
);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

