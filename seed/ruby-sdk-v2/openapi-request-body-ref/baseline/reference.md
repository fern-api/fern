# Reference
## Vendor
<details><summary><code>client.vendor.<a href="/lib/seed/vendor/client.rb">update_vendor</a>(vendor_id, request) -> Seed::Types::Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.vendor.update_vendor(
  vendor_id: "vendor_id",
  name: "name"
)
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

**vendor_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::UpdateVendorRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Vendor::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.vendor.<a href="/lib/seed/vendor/client.rb">create_vendor</a>(request) -> Seed::Types::Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.vendor.create_vendor(name: "name")
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

**idempotency_key:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Vendor::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Catalog
<details><summary><code>client.catalog.<a href="/lib/seed/catalog/client.rb">create_catalog_image</a>(request) -> Seed::Types::CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.catalog.create_catalog_image
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

**request_options:** `Seed::Catalog::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.catalog.<a href="/lib/seed/catalog/client.rb">get_catalog_image</a>(image_id) -> Seed::Types::CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.catalog.get_catalog_image(image_id: "image_id")
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

**image_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Catalog::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TeamMember
<details><summary><code>client.team_member.<a href="/lib/seed/team_member/client.rb">update_team_member</a>(team_member_id, request) -> Seed::Types::TeamMember</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.team_member.update_team_member(team_member_id: "team_member_id")
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

**team_member_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**given_name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**family_name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**email_address:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::TeamMember::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

