use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        ..extended_inline_request_body(
            &ExtendedInlineRequestBodyRequest {
                parent: "parent".to_string(),
                child: "child".to_string(),
            },
            None,
        )
        .await;
}
