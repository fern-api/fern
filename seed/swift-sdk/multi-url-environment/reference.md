# Reference
## Ec2
<details><summary><code>client.ec2.<a href="/Sources/Resources/Ec2/Ec2Client.swift">bootInstance</a>(request: Requests.BootInstanceRequest, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import MultiUrlEnvironment

private func main() async throws {
    let client = MultiUrlEnvironmentClient(token: "<token>")

    _ = try await client.ec2.bootInstance(request: .init(size: "size"))
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

**request:** `Requests.BootInstanceRequest` 
    
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

## S3
<details><summary><code>client.s3.<a href="/Sources/Resources/S3/S3Client.swift">getPresignedUrl</a>(request: Requests.GetPresignedUrlRequest, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import MultiUrlEnvironment

private func main() async throws {
    let client = MultiUrlEnvironmentClient(token: "<token>")

    _ = try await client.s3.getPresignedUrl(request: .init(s3Key: "s3Key"))
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

**request:** `Requests.GetPresignedUrlRequest` 
    
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

