use seed_idempotency_headers::{ClientConfig, IdempotencyHeadersClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = IdempotencyHeadersClient::new(config).expect("Failed to build client");
    client.payment_delete("paymentId").await;
}
