use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        ..update_foo(
            &"id".to_string(),
            &UpdateFooRequest {
                ..Default::default()
            },
            Some(RequestOptions::new().additional_header("X-Idempotency-Key", "X-Idempotency-Key")),
        )
        .await;
}
