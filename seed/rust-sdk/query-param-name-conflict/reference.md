# Reference
<details><summary><code>client.<a href="/src/client.rs">bulk_update_tasks</a>(request: BulkUpdateTasksRequest, assigned_to: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, is_complete: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, date: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, fields: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;BulkUpdateTasksResponse, ApiError&gt;</code></summary>
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
        .bulk_update_tasks(
            &BulkUpdateTasksRequest {
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

**bulk_update_tasks_request_assigned_to:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**bulk_update_tasks_request_date:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**bulk_update_tasks_request_is_complete:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**text:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**assigned_to:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**is_complete:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<Option<String>>` — Comma-separated list of fields to include in the response.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

