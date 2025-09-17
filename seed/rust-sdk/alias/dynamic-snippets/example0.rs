use seed_alias::{AliasClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = AliasClient::new(config).expect("Failed to build client");
    client.get("typeId").await;
}
