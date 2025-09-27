use seed_package_yml::{ClientConfig, PackageYmlClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = PackageYmlClient::new(config).expect("Failed to build client");
    client.service_nop("id", "nestedId").await;
}
