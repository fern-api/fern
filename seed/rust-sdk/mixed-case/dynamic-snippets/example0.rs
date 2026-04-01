use seed_mixed_case::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = MixedCaseClient::new(config).expect("Failed to build client");
    client.service.get_resource(&"rsc-xyz".to_string(), None).await;
}
