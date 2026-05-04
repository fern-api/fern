# Reference
## Vendor
<details><summary><code>client.vendor.updateVendor(vendorId, request) -> Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.vendor().updateVendor(
    "vendor_id",
    UpdateVendorBody
        .builder()
        .body(
            UpdateVendorRequest
                .builder()
                .name("name")
                .build()
        )
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

**vendorId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdateVendorRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.vendor.createVendor(request) -> Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.vendor().createVendor(
    CreateVendorRequest
        .builder()
        .name("name")
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

**idempotencyKey:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Catalog
<details><summary><code>client.catalog.createCatalogImage(request) -> CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.catalog().createCatalogImage(
    null,
    CreateCatalogImageBody
        .builder()
        .request(
            CreateCatalogImageRequest
                .builder()
                .catalogObjectId("catalog_object_id")
                .build()
        )
        .build()
);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.catalog.getCatalogImage(imageId) -> CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.catalog().getCatalogImage(
    "image_id",
    GetCatalogImageRequest
        .builder()
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

**imageId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TeamMember
<details><summary><code>client.teamMember.updateTeamMember(teamMemberId, request) -> TeamMember</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.teamMember().updateTeamMember(
    "team_member_id",
    UpdateTeamMemberRequest
        .builder()
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

**teamMemberId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**givenName:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**familyName:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**emailAddress:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

