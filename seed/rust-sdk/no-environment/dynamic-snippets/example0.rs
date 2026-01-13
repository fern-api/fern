use seed_no_environment::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = NoEnvironmentClient::new(config).expect("Failed to build client");
    client.dummy.get_dummy(None).await;
}
