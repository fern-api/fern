use seed_mixed_case::{ClientConfig, MixedCaseClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = MixedCaseClient::new(config).expect("Failed to build client");
    client.service_get_resource("ResourceID").await;
}
