use seed_package_yml::{ClientConfig, PackageYmlClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = PackageYmlClient::new(config).expect("Failed to build client");
    client.service_nop("id", "nestedId").await;
}
