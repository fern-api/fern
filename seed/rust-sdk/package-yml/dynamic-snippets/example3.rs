use seed_package_yml::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = PackageYmlClient::new(config).expect("Failed to build client");
    client.service.nop(&"id".to_string(), &"nestedId".to_string(), None).await;
}
