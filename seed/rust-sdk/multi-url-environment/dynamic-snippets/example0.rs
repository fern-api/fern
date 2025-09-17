use seed_multi_url_environment::{BootInstanceRequest, ClientConfig, MultiUrlEnvironmentClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = MultiUrlEnvironmentClient::new(config).expect("Failed to build client");
    client
        .ec_2_boot_instance(BootInstanceRequest { size: "size" })
        .await;
}
