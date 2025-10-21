# Reference
## Simple
<details><summary><code>client.simple.<a href="/src/api/resources/simple/client.rs">foo_without_endpoint_error</a>(request: FooRequest) -> Result<FooResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_errors::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ErrorsClient::new(config).expect("Failed to build client");
    client
        .simple
        .foo_without_endpoint_error(
            &FooRequest {
                bar: "bar".to_string(),
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

<details><summary><code>client.simple.<a href="/src/api/resources/simple/client.rs">foo</a>(request: FooRequest) -> Result<FooResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_errors::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ErrorsClient::new(config).expect("Failed to build client");
    client
        .simple
        .foo(
            &FooRequest {
                bar: "bar".to_string(),
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

<details><summary><code>client.simple.<a href="/src/api/resources/simple/client.rs">foo_with_examples</a>(request: FooRequest) -> Result<FooResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_errors::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ErrorsClient::new(config).expect("Failed to build client");
    client
        .simple
        .foo_with_examples(
            &FooRequest {
                bar: "hello".to_string(),
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
