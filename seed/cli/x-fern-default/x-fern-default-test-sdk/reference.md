# Reference
<details><summary><code>client.<a href="/src/client.rs">test_get</a>(region: String, limit: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;TestGetResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use x_fern_default_test_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = XFernDefaultTestClient::new(config).expect("Failed to build client");
    client
        .test_get(
            &"region".to_string(),
            &TestGetQueryRequest {
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

**region:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">test_get_via_overrides</a>(region: String, limit: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;TestGetViaOverridesResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use x_fern_default_test_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = XFernDefaultTestClient::new(config).expect("Failed to build client");
    client
        .test_get_via_overrides(
            &"region".to_string(),
            &TestGetViaOverridesQueryRequest {
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

**region:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

