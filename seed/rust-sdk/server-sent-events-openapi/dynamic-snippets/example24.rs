use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .validate_completion(
            &SharedCompletionRequest {
                prompt: "prompt".to_string(),
                model: "model".to_string(),
                stream: None,
            },
            None,
        )
        .await;
}
