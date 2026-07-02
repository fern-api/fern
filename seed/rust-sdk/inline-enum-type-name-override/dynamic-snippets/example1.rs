use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .reporting
        .load(
            &LoadRequest {
                cache: Some(LoadRequestCache::StaleIfSlow),
                status: Some(LoadRequestStatus::Active),
                ..Default::default()
            },
            None,
        )
        .await;
}
