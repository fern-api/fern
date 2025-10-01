use seed_nullable_optional::{ClientConfig, NullableOptionalClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .get_notification_settings(&"userId".to_string(), None)
        .await;
}
