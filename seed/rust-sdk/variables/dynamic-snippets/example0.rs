use seed_variables::{ClientConfig, VariablesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = VariablesClient::new(config).expect("Failed to build client");
    client.service_post().await;
}
