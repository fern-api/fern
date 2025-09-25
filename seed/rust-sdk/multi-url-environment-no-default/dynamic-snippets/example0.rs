use seed_multi_url_environment_no_default::{
    BootInstanceRequest, ClientConfig, MultiUrlEnvironmentNoDefaultClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = MultiUrlEnvironmentNoDefaultClient::new(config).expect("Failed to build client");
    client
        .ec_2_boot_instance(BootInstanceRequest { size: "size" })
        .await;
}
