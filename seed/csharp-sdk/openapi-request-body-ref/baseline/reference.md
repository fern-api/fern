# Reference
## Vendor
<details><summary><code>client.Vendor.<a href="/src/SeedApi/Vendor/VendorClient.cs">UpdateVendorAsync</a>(UpdateVendorBody { ... }) -> WithRawResponseTask&lt;Vendor&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Vendor.UpdateVendorAsync(
    new UpdateVendorBody
    {
        VendorId = "vendor_id",
        Body = new UpdateVendorRequest { Name = "name" },
    }
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

**request:** `UpdateVendorBody` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Vendor.<a href="/src/SeedApi/Vendor/VendorClient.cs">CreateVendorAsync</a>(CreateVendorRequest { ... }) -> WithRawResponseTask&lt;Vendor&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Vendor.CreateVendorAsync(new CreateVendorRequest { Name = "name" });
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

**request:** `CreateVendorRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Catalog
<details><summary><code>client.Catalog.<a href="/src/SeedApi/Catalog/CatalogClient.cs">CreateCatalogImageAsync</a>(CreateCatalogImageBody { ... }) -> WithRawResponseTask&lt;CatalogImage&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Catalog.CreateCatalogImageAsync(
    new CreateCatalogImageBody
    {
        Request = new CreateCatalogImageRequest { CatalogObjectId = "catalog_object_id" },
    }
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

**request:** `CreateCatalogImageBody` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Catalog.<a href="/src/SeedApi/Catalog/CatalogClient.cs">GetCatalogImageAsync</a>(GetCatalogImageRequest { ... }) -> WithRawResponseTask&lt;CatalogImage&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Catalog.GetCatalogImageAsync(new GetCatalogImageRequest { ImageId = "image_id" });
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

**request:** `GetCatalogImageRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TeamMember
<details><summary><code>client.TeamMember.<a href="/src/SeedApi/TeamMember/TeamMemberClient.cs">UpdateTeamMemberAsync</a>(UpdateTeamMemberRequest { ... }) -> WithRawResponseTask&lt;TeamMember&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.TeamMember.UpdateTeamMemberAsync(
    new UpdateTeamMemberRequest { TeamMemberId = "team_member_id" }
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

**request:** `UpdateTeamMemberRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

