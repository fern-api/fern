use seed_client_side_params::{ClientConfig, ClientSideParamsClient, GetConnectionQueryRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .get_connection(
            &"connectionId".to_string(),
            &GetConnectionQueryRequest {
                fields: Some("fields".to_string()),
            },
            None,
        )
        .await;
}
