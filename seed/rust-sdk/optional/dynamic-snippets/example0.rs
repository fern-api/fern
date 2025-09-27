use seed_objects_with_imports::{ClientConfig, ObjectsWithImportsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ObjectsWithImportsClient::new(config).expect("Failed to build client");
    client
        .optional_send_optional_body(Some(todo!("Unhandled type reference")))
        .await;
}
