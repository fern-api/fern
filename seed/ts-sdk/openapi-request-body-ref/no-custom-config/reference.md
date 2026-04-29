# Reference
## Vendor
<details><summary><code>client.vendor.<a href="/src/api/resources/vendor/client/Client.ts">updateVendor</a>({ ...params }) -> SeedApi.Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.vendor.updateVendor({
    vendor_id: "vendor_id",
    body: {
        name: "name"
    }
});

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

**request:** `SeedApi.UpdateVendorBody` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `VendorClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.vendor.<a href="/src/api/resources/vendor/client/Client.ts">createVendor</a>({ ...params }) -> SeedApi.Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.vendor.createVendor({
    name: "name"
});

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

**request:** `SeedApi.CreateVendorRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `VendorClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Catalog
<details><summary><code>client.catalog.<a href="/src/api/resources/catalog/client/Client.ts">createCatalogImage</a>({ ...params }) -> SeedApi.CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.catalog.createCatalogImage({
    request: {
        catalog_object_id: "catalog_object_id"
    }
});

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

**request:** `SeedApi.CreateCatalogImageBody` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CatalogClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.catalog.<a href="/src/api/resources/catalog/client/Client.ts">getCatalogImage</a>({ ...params }) -> SeedApi.CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.catalog.getCatalogImage({
    image_id: "image_id"
});

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

**request:** `SeedApi.GetCatalogImageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CatalogClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TeamMember
<details><summary><code>client.teamMember.<a href="/src/api/resources/teamMember/client/Client.ts">updateTeamMember</a>({ ...params }) -> SeedApi.TeamMember</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.teamMember.updateTeamMember({
    team_member_id: "team_member_id"
});

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

**request:** `SeedApi.UpdateTeamMemberRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TeamMemberClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

