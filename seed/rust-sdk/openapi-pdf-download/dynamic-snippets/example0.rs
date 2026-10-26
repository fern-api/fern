use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
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
