use seed_license::{ClientConfig, LicenseClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = LicenseClient::new(config).expect("Failed to build client");
    client.get(None).await;
}
