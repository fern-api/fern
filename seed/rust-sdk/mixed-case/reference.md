# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_resource</a>(resource_id: String) -> Result<Resource, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_mixed_case::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = MixedCaseClient::new(config).expect("Failed to build client");
    client
        .service
        .get_resource(&"rsc-xyz".to_string(), None)
        .await;
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

**resource_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">list_resources</a>(page_limit: Option<i64>, before_date: Option<String>) -> Result<Vec<Resource>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_mixed_case::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = MixedCaseClient::new(config).expect("Failed to build client");
    client
        .service
        .list_resources(
            &ListResourcesQueryRequest {
                page_limit: 10,
                before_date: NaiveDate::parse_from_str("2023-01-01", "%Y-%m-%d").unwrap(),
            },
            None,
        )
        .await;
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

**page_limit:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**before_date:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
