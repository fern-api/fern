use seed_client_side_params::{ClientConfig, ClientSideParamsClient, GetUserRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service_get_user_by_id(
            "userId",
            GetUserRequest {
                fields: Some("fields"),
                include_fields: Some(true),
            },
        )
        .await;
}
