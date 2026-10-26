# Reference
## Calls Calls
<details><summary><code>client.calls().calls.<a href="/src/api/resources/calls/calls/client.rs">create_call</a>() -> Result&lt;Call, ApiError&gt;</code></summary>
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
    client.calls.calls.create_call(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Messages Messages
<details><summary><code>client.messages().messages.<a href="/src/api/resources/messages/messages/client.rs">list_messages</a>() -> Result&lt;Vec&lt;Message&gt;, ApiError&gt;</code></summary>
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
    client.messages.messages.list_messages(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.messages().messages.<a href="/src/api/resources/messages/messages/client.rs">create_message</a>(request: Message) -> Result&lt;Message, ApiError&gt;</code></summary>
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
        .messages
        .messages
        .create_message(
            &Message {
                sid: "sid".to_string(),
                body: "body".to_string(),
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


</dd>
</dl>
</details>

<details><summary><code>client.messages().messages.<a href="/src/api/resources/messages/messages/client.rs">delete_message</a>(sid: String) -> Result&lt;(), ApiError&gt;</code></summary>
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
        .messages
        .messages
        .delete_message(&"sid".to_string(), None)
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

**sid:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

