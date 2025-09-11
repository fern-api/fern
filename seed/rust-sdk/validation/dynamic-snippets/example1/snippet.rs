use seed_validation::{ClientConfig, ValidationClient, GetRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ValidationClient::new(config).expect("Failed to build client");
    client.get(GetRequest { decimal: todo!("Unhandled primitive: DOUBLE"), even: 100, name: "fern" }).await;
}
