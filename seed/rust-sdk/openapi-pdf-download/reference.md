# Reference
## AssetReport
<details><summary><code>client.asset_report.<a href="/src/api/resources/asset_report/client.rs">get_pdf</a>(request: AssetReportPdfGetRequest) -> Result&lt;Vec&lt;u8&gt;, ApiError&gt;</code></summary>
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
        .asset_report
        .get_pdf(
            &AssetReportPdfGetRequest {
                asset_report_token: "asset_report_token".to_string(),
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

<details><summary><code>client.asset_report.<a href="/src/api/resources/asset_report/client.rs">get</a>(request: AssetReportPdfGetRequest) -> Result&lt;AssetReportGetResponse, ApiError&gt;</code></summary>
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
        .asset_report
        .get(
            &AssetReportPdfGetRequest {
                asset_report_token: "asset_report_token".to_string(),
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

