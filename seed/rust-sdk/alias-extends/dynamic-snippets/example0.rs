use seed_alias_extends::{AliasExtendsClient, ClientConfig, InlinedChildRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = AliasExtendsClient::new(config).expect("Failed to build client");
    client
        .extended_inline_request_body(InlinedChildRequest {
            parent: "parent",
            child: "child",
        })
        .await;
}
