# Reference
## Vendor
<details><summary><code>client.vendor.<a href="/Sources/Resources/Vendor/VendorClient.swift">updateVendor</a>(vendorId: String, request: UpdateVendorRequest, requestOptions: RequestOptions?) -> Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.vendor.updateVendor(
        vendorId: "vendor_id",
        request: UpdateVendorRequest(
            name: "name"
        )
    )
}

try await main()
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

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.vendor.<a href="/Sources/Resources/Vendor/VendorClient.swift">createVendor</a>(idempotencyKey: String?, request: Requests.CreateVendorRequest, requestOptions: RequestOptions?) -> Vendor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.vendor.createVendor(request: .init(name: "name"))
}

try await main()
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

**idempotencyKey:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.CreateVendorRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Catalog
<details><summary><code>client.catalog.<a href="/Sources/Resources/Catalog/CatalogClient.swift">createCatalogImage</a>(request: Requests.CreateCatalogImageBody, requestOptions: RequestOptions?) -> CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.catalog.createCatalogImage(request: .init(
        imageFile: .init(data: Data("".utf8)),
        request: CreateCatalogImageRequest(
            catalogObjectId: "catalog_object_id"
        )
    ))
}

try await main()
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

**request:** `Requests.CreateCatalogImageBody` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.catalog.<a href="/Sources/Resources/Catalog/CatalogClient.swift">getCatalogImage</a>(imageId: String, requestOptions: RequestOptions?) -> CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.catalog.getCatalogImage(imageId: "image_id")
}

try await main()
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

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TeamMember
<details><summary><code>client.teamMember.<a href="/Sources/Resources/TeamMember/TeamMemberClient.swift">updateTeamMember</a>(teamMemberId: String, request: Requests.UpdateTeamMemberRequest, requestOptions: RequestOptions?) -> TeamMember</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.teamMember.updateTeamMember(
        teamMemberId: "team_member_id",
        request: .init()
    )
}

try await main()
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

**request:** `Requests.UpdateTeamMemberRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

