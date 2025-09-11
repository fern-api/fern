use seed_validation::{ClientConfig, ValidationClient, CreateRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ValidationClient::new(config).expect("Failed to build client");
    client.create(CreateRequest { decimal: todo!("Unhandled primitive: DOUBLE"), even: 100, name: "fern", shape: "SQUARE" }).await;
}
