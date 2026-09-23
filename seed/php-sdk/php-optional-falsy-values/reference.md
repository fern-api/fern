# Reference
<details><summary><code>$client-&gt;listAuditLogs($request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List audit logs, starting from an optional zero offset.
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
$client->listAuditLogs(
    new ListAuditLogsRequest([
        'offset' => 0,
        'includeResolved' => false,
        'filter' => '0',
        'xMaxResults' => 0,
        'xIncludeResolved' => false,
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

**$offset:** `?int` 
    
</dd>
</dl>

<dl>
<dd>

**$includeResolved:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$filter:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$xMaxResults:** `?int` 
    
</dd>
</dl>

<dl>
<dd>

**$xIncludeResolved:** `?bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;countAuditLogs($request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Count audit logs, optionally restricting to resolved entries.
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
$client->countAuditLogs(
    new CountAuditLogsRequest([
        'resolvedOnly' => false,
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

**$resolvedOnly:** `?bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;uploadAuditLog($request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Upload an audit log file, optionally flagging it as resolved.
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
$client->uploadAuditLog(
    new UploadAuditLogRequest([
        'file' => File::createFromString("example_file", "example_file"),
        'resolved' => false,
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

