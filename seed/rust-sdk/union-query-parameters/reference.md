# Reference
## Events
<details><summary><code>client.events.<a href="/src/api/resources/events/client.rs">subscribe</a>(event_type: Option&lt;Option&lt;EventTypeParam&gt;&gt;, tags: Option&lt;Option&lt;StringOrListParam&gt;&gt;) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Subscribe to events with a oneOf-style query parameter that may be a
scalar enum value or a list of enum values.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_union_query_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionQueryParametersClient::new(config).expect("Failed to build client");
    client
        .events
        .subscribe(
            &SubscribeQueryRequest {
                event_type: Some(EventTypeParam::EventTypeEnum(EventTypeEnum::GroupCreated)),
                tags: Some(StringOrListParam::String("tags".to_string())),
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

**event_type:** `Option<EventTypeParam>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Option<StringOrListParam>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

