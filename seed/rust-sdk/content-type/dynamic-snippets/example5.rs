use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .namedpatchwithmixed(
            &"id".to_string(),
            &ServiceNamedPatchWithMixedRequest {
                app_id: Some("appId".to_string()),
                instructions: Some("instructions".to_string()),
                active: Some(true),
                ..Default::default()
            },
            None,
        )
        .await;
}
