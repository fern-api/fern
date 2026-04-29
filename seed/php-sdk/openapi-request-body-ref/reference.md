# Reference
## Vendor
<details><summary><code>$client-&gt;vendor-&gt;updateVendor($vendorId, $request) -> ?Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->vendor->updateVendor(
    'vendor_id',
    new UpdateVendorBody([
        'body' => new UpdateVendorRequest([
            'name' => 'name',
        ]),
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

**$vendorId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `UpdateVendorRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;vendor-&gt;createVendor($request) -> ?Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->vendor->createVendor(
    new CreateVendorRequest([
        'name' => 'name',
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

**$idempotencyKey:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$name:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$address:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Catalog
<details><summary><code>$client-&gt;catalog-&gt;createCatalogImage($request) -> ?CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->catalog->createCatalogImage(
    new CreateCatalogImageBody([
        'imageFile' => File::createFromString("example_image_file", "example_image_file"),
        'request' => new CreateCatalogImageRequest([
            'catalogObjectId' => 'catalog_object_id',
        ]),
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

<details><summary><code>$client-&gt;catalog-&gt;getCatalogImage($imageId) -> ?CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->catalog->getCatalogImage(
    'image_id',
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

**$imageId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TeamMember
<details><summary><code>$client-&gt;teamMember-&gt;updateTeamMember($teamMemberId, $request) -> ?TeamMember</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->teamMember->updateTeamMember(
    'team_member_id',
    new UpdateTeamMemberRequest([]),
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

**$teamMemberId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$givenName:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$familyName:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$emailAddress:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

