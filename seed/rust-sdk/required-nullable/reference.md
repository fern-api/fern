# Reference
<details><summary><code>client.<a href="/src/client.rs">get_foo</a>(optional_baz: Option&lt;Option&lt;String&gt;&gt;, optional_nullable_baz: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, required_baz: Option&lt;String&gt;, required_nullable_baz: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;Foo, ApiError&gt;</code></summary>
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
                optional_baz: None,
                optional_nullable_baz: None,
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

<details><summary><code>client.<a href="/src/client.rs">update_foo</a>(id: String, request: UpdateFooRequest) -> Result&lt;Foo, ApiError&gt;</code></summary>
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
        .update_foo(
            &"id".to_string(),
            &UpdateFooRequest {
                nullable_text: Some("nullable_text".to_string()),
                nullable_number: Some(1.1),
                non_nullable_text: Some("non_nullable_text".to_string()),
                ..Default::default()
            },
            Some(RequestOptions::new().additional_header("X-Idempotency-Key", "X-Idempotency-Key")),
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_text:** `Option<Option<String>>` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**nullable_number:** `Option<Option<f64>>` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**non_nullable_text:** `Option<String>` — Regular non-nullable field
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

