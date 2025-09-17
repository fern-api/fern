use seed_undiscriminated_unions::{ClientConfig, UndiscriminatedUnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union__update_metadata(serde_json::json!({"string":{"key":"value"}}))
        .await;
}
