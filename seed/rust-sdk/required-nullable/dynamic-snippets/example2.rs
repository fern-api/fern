use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .update_foo(
            &"id".to_string(),
            &UpdateFooRequest {
                x_idempotency_key: "X-Idempotency-Key".to_string(),
                nullable_text: Some(Some("nullable_text".to_string())),
                nullable_number: Some(Some(1.1)),
                non_nullable_text: Some("non_nullable_text".to_string()),
            },
            None,
        )
        .await;
}
