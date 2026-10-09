use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .required_refund(
            &"refund-id".to_string(),
            &RefundRequest {
                amount: Some(60.0),
                ..Default::default()
            },
            None,
        )
        .await;
}
