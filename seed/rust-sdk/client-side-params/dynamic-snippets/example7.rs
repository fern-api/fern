use seed_client_side_params::{ClientConfig, ClientSideParamsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client.service_delete_user("userId").await;
}
