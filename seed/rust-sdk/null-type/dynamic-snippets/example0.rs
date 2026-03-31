use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .conversations
        .outbound_call(
            &OutboundCallConversationsRequest {
                to_phone_number: "to_phone_number".to_string(),
                dry_run: None,
            },
            None,
        )
        .await;
}
