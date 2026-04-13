# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">getresource</a>(resource_id: String) -> Result&lt;Resource, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .getresource(&"ResourceID".to_string(), None)
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">listresources</a>(page_limit: Option&lt;i64&gt;, before_date: Option&lt;String&gt;) -> Result&lt;Vec&lt;Resource&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .listresources(
            &ListresourcesQueryRequest {
                page_limit: 1,
                before_date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
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

