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
        .post(
            &"pathParam".to_string(),
            &"serviceParam".to_string(),
            1,
            &"resourceParam".to_string(),
            None,
        )
        .await;
}
