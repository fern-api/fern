# Reference
<details><summary><code>client.<a href="/src/client.rs">create_ast</a>(request: AstNode) -> Result&lt;AstNode, ApiError&gt;</code></summary>
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
        .create_ast(
            &AstNode::Llm {
                data: AstNodeLlm {
                    model: "model".to_string(),
                    ..Default::default()
                },
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


</dd>
</dl>
</details>

