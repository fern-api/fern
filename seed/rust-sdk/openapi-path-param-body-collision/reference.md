# Reference
<details><summary><code>client.<a href="/src/client.rs">update_profile_identifier</a>(profile_id: String, id_type_path_param: String, request: IdentifierUpdate) -> Result&lt;UpdateProfileIdentifierResponse, ApiError&gt;</code></summary>
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
        .update_profile_identifier(
            &"profile_123".to_string(),
            &"email".to_string(),
            &IdentifierUpdate {
                id_type: "phone".to_string(),
                old_value: "+13175556789".to_string(),
                new_value: "+13175556798".to_string(),
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

**profile_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**id_type_path_param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**id_type:** `String` — The identifier type to update.
    
</dd>
</dl>

<dl>
<dd>

**old_value:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**new_value:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

