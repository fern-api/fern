# Reference
## Nullable
<details><summary><code>client.nullable.<a href="/Sources/Resources/Nullable/NullableClient.swift">getusers</a>(usernames: Nullable&lt;String&gt;?, avatar: Nullable&lt;String&gt;?, activated: Nullable&lt;Bool&gt;?, tags: Nullable&lt;String&gt;?, extra: Nullable&lt;Bool&gt;?, requestOptions: RequestOptions?) -> [User]</code></summary>
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

    _ = try await client.nullable.getusers()
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

**usernames:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**activated:** `Nullable<Bool>?` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**extra:** `Nullable<Bool>?` 
    
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

<details><summary><code>client.nullable.<a href="/Sources/Resources/Nullable/NullableClient.swift">createuser</a>(request: Requests.NullableCreateUserRequest, requestOptions: RequestOptions?) -> User</code></summary>
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

    _ = try await client.nullable.createuser(request: .init(username: "username"))
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

**request:** `Requests.NullableCreateUserRequest` 
    
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

<details><summary><code>client.nullable.<a href="/Sources/Resources/Nullable/NullableClient.swift">deleteuser</a>(request: Requests.NullableDeleteUserRequest, requestOptions: RequestOptions?) -> Bool</code></summary>
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

    _ = try await client.nullable.deleteuser(request: .init())
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

**request:** `Requests.NullableDeleteUserRequest` 
    
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

