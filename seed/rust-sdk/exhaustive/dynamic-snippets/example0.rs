use seed_exhaustive::{ClientConfig, ExhaustiveClient};
use std::collections::HashSet;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .container
        .get_and_return_list_of_primitives(&vec!["string".to_string(), "string".to_string()], None)
        .await;
}
