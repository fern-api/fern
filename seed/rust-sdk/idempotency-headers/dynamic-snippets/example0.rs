use seed_idempotency_headers::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = IdempotencyHeadersClient::new(config).expect("Failed to build client");
    client
        .payment
        .create(
            &CreatePaymentRequest {
                amount: 1,
                currency: Currency::Usd,
            },
            None,
        )
        .await;
}
