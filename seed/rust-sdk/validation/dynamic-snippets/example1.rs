use seed_validation::{ClientConfig, GetRequest, ValidationClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ValidationClient::new(config).expect("Failed to build client");
    client
        .get(GetRequest {
            decimal: todo!("Unhandled primitive: DOUBLE"),
            even: 100,
            name: "fern",
        })
        .await;
}
