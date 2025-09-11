use seed_alias_extends::{ClientConfig, AliasExtendsClient, InlinedChildRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = AliasExtendsClient::new(config).expect("Failed to build client");
    client.extended_inline_request_body(InlinedChildRequest { parent: "parent", child: "child" }).await;
}
