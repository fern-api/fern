use seed_cross_package_type_names::{ClientConfig, CrossPackageTypeNamesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = CrossPackageTypeNamesClient::new(config).expect("Failed to build client");
    client.folder_a_service_get_direct_thread().await;
}
