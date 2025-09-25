use seed_extends::{ClientConfig, ExtendsClient, Inlined};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ExtendsClient::new(config).expect("Failed to build client");
    client
        .extended_inline_request_body(Inlined {
            name: "name",
            docs: "docs",
            unique: "unique",
        })
        .await;
}
