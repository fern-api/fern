# Reference
<details><summary><code>client.<a href="/src/client.rs">bulk_update_tasks</a>(request: BulkUpdateTasksRequest, filter_assigned_to: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, filter_is_complete: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, filter_date: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, fields: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;BulkUpdateTasksResponse, ApiError&gt;</code></summary>
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
                filter_assigned_to: None,
                filter_is_complete: None,
                filter_date: None,
                fields: None,
                bulk_update_tasks_request_assigned_to: None,
                bulk_update_tasks_request_date: None,
                bulk_update_tasks_request_is_complete: None,
                text: None,
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

**bulk_update_tasks_request_assigned_to:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**bulk_update_tasks_request_date:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**bulk_update_tasks_request_is_complete:** `Option<bool>` 
    
</dd>
</dl>

<dl>
<dd>

**text:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**filter_assigned_to:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**filter_is_complete:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**filter_date:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<String>` — Comma-separated list of fields to include in the response.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

