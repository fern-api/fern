use seed_nullable_optional::{ClientConfig, NullableOptionalClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional_get_notification_settings("userId")
        .await;
}
