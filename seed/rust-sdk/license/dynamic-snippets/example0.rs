use seed_license::{ClientConfig, LicenseClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = LicenseClient::new(config).expect("Failed to build client");
    client.get().await;
}
