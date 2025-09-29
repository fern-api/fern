use seed_nursery_api::{ClientConfig, NurseryApiClient, TestRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = NurseryApiClient::new(config).expect("Failed to build client");
    client.package_test(TestRequest { for_: "for" }).await;
}
