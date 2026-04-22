use seed_cross_package_type_names::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = CrossPackageTypeNamesClient::new(config).expect("Failed to build client");
    client.folder_a.service.get_direct_thread(None).await;
}
