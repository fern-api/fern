# Reference
## Vendor
<details><summary><code>client.Vendor.UpdateVendor(VendorID, request) -> *fern.Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UpdateVendorBody{
        VendorID: "vendor_id",
        Body: &fern.UpdateVendorRequest{
            Name: "name",
        },
    }
client.Vendor.UpdateVendor(
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

**vendorID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.UpdateVendorRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Vendor.CreateVendor(request) -> *fern.Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreateVendorRequest{
        Name: "name",
    }
client.Vendor.CreateVendor(
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

**idempotencyKey:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Catalog
<details><summary><code>client.Catalog.CreateCatalogImage(request) -> *fern.CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreateCatalogImageBody{
        ImageFile: strings.NewReader(
            "",
        ),
        Request: &fern.CreateCatalogImageRequest{
            CatalogObjectID: "catalog_object_id",
        },
    }
client.Catalog.CreateCatalogImage(
        context.TODO(),
        request,
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Catalog.GetCatalogImage(ImageID) -> *fern.CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetCatalogImageRequest{
        ImageID: "image_id",
    }
client.Catalog.GetCatalogImage(
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

**imageID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TeamMember
<details><summary><code>client.TeamMember.UpdateTeamMember(TeamMemberID, request) -> *fern.TeamMember</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UpdateTeamMemberRequest{
        TeamMemberID: "team_member_id",
    }
client.TeamMember.UpdateTeamMember(
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

**teamMemberID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**givenName:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**familyName:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**emailAddress:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

