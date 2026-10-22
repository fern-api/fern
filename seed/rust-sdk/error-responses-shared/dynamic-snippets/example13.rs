use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .messages
        .messages
        .create_message(
            &Message {
                sid: "sid".to_string(),
                body: "body".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;
}
