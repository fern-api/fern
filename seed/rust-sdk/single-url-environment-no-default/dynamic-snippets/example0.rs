use seed_single_url_environment_no_default::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = SingleUrlEnvironmentNoDefaultClient::new(config).expect("Failed to build client");
    client.dummy.get_dummy(None).await;
}
