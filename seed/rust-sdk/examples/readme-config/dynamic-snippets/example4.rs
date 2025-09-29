use seed_examples::{ClientConfig, ExamplesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .file
        .notification
        .service
        .get_exception(&"notificationId".to_string(), None)
        .await;
}
