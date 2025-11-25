use seed_api_wide_base_path::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiWideBasePathClient::new(config).expect("Failed to build client");
    client
        .service
        .post(
            &"pathParam".to_string(),
            &"serviceParam".to_string(),
            &1,
            &"resourceParam".to_string(),
            None,
        )
        .await;
}
