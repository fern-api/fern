use seed_client_side_params::prelude::*;

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
        .get_user_by_id(
            &"userId".to_string(),
            &GetUserByIdQueryRequest {
                fields: Some("fields".to_string()),
                include_fields: Some(true),
                ..Default::default()
            },
            None,
        )
        .await;
}
