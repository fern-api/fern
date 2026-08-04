# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_speech_to_speech_settings</a>(request: SpeechToSpeechRequest) -> Result&lt;(), ApiError&gt;</code></summary>
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
        .get_speech_to_speech_settings(
            &SpeechToSpeechRequest {
                voice_id: "voice_id".to_string(),
                model_id: Some("model_id".to_string()),
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

**voice_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**model_id:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">simple</a>() -> Result&lt;(), ApiError&gt;</code></summary>
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
    client.service.simple(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

