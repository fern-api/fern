use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .getclient(
            &"clientId".to_string(),
            &GetclientQueryRequest {
                fields: Some("fields".to_string()),
                include_fields: Some(true),
                ..Default::default()
            },
            None,
        )
        .await;
}
