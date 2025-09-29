use seed_property_access::{ClientConfig, PropertyAccessClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = PropertyAccessClient::new(config).expect("Failed to build client");
    client.create_user(serde_json::json!({"id":"id","email":"email","password":"password","profile":{"name":"name","verification":{"verified":"verified"},"ssn":"ssn"}})).await;
}
