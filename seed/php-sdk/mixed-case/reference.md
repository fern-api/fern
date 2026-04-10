# Reference
## Service
<details><summary><code>$client-&gt;service-&gt;getresource($resourceId) -> ResourceZero|ResourceOne|null</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->getresource(
    'ResourceID',
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

**$resourceId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;listresources($request) -> ?array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->listresources(
    new ServiceListResourcesRequest([
        'pageLimit' => 1,
        'beforeDate' => new DateTime('2023-01-15'),
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

**$pageLimit:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$beforeDate:** `DateTime` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

