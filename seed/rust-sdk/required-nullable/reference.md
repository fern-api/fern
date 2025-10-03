# Reference
<details><summary><code>client.<a href="/src/client.rs">get_foo</a>(optional_baz: Option<Option<String>>, optional_nullable_baz: Option<Option<Option<String>>>, required_baz: Option<String>, required_nullable_baz: Option<Option<String>>) -> Result<Foo, ApiError></code></summary>
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
        .get_foo(
            &GetFooQueryRequest {
                required_baz: "required_baz".to_string(),
                required_nullable_baz: Some("required_nullable_baz".to_string()),
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

**optional_baz:** `Option<String>` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**optional_nullable_baz:** `Option<Option<String>>` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**required_baz:** `String` — A required baz
    
</dd>
</dl>

<dl>
<dd>

**required_nullable_baz:** `Option<String>` — A required baz
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
