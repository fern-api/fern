use seed_validation::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ValidationClient::new(config).expect("Failed to build client");
    client
        .get(
            &GetQueryRequest {
                decimal: 2.2,
                even: 100,
                name: "fern".to_string(),
            },
            None,
        )
        .await;
}
