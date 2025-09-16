use seed_mixed_case::{ClientConfig, MixedCaseClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = MixedCaseClient::new(config).expect("Failed to build client");
    client.service_get_resource("rsc-xyz").await;
}
