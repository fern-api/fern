use seed_extends::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ExtendsClient::new(config).expect("Failed to build client");
    client
        .extended_inline_request_body(
            &Inlined {
                name: "name".to_string(),
                docs: "docs".to_string(),
                unique: "unique".to_string(),
            },
            None,
        )
        .await;
}
