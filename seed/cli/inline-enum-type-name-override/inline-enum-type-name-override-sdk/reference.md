# Reference
## Reporting
<details><summary><code>client.reporting.<a href="/src/api/resources/reporting/client.rs">load</a>(request: LoadRequest) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use inline_enum_type_name_override_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = InlineEnumTypeNameOverrideClient::new(config).expect("Failed to build client");
    client
        .reporting
        .load(
            &LoadRequest {
                ..Default::default()
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

**cache:** `Option<LoadRequestCache>` 
    
</dd>
</dl>

<dl>
<dd>

**status:** `Option<LoadRequestStatus>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

