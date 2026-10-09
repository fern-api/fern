use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .bulk_refund(
            Some(&RefundRequest {
                amount: Some(1.1),
                ..Default::default()
            }),
            None,
        )
        .await;
}
