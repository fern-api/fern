use seed_nursery_api::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = NurseryApiClient::new(config).expect("Failed to build client");
    client.package.test(&TestQueryRequest {
        r#for: "for".to_string()
    }, None).await;
}
