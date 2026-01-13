use seed_alias::prelude::{*};
use seed_alias::{TypeId};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = AliasClient::new(config).expect("Failed to build client");
    client.get(&TypeId("typeId".to_string()), None).await;
}
