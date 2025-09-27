use seed_client_side_params::{ClientConfig, ClientSideParamsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client.service_create_user(serde_json::json!({"email":"email","email_verified":true,"username":"username","password":"password","phone_number":"phone_number","phone_verified":true,"user_metadata":{"user_metadata":{"key":"value"}},"app_metadata":{"app_metadata":{"key":"value"}},"connection":"connection"})).await;
}
