use seed_path_parameters::{ClientConfig, PathParametersClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client.user_create_user("tenant_id", serde_json::json!({"name":"name","tags":["tags","tags"]})).await;
}
