use seed_path_parameters::{ClientConfig, PathParametersClient, UpdateUserRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client.user_update_user("tenant_id", "user_id", UpdateUserRequest { body: serde_json::json!({"name":"name","tags":["tags","tags"]}) }).await;
}
