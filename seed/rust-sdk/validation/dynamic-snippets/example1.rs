use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        ..create(
            &CreateRequest {
                decimal: 1.1,
                even: 1,
                name: "name".to_string(),
                shape: Shape::Square,
            },
            None,
        )
        .await;
}
