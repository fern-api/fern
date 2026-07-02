use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .clients
        .create(
            &ClientRequest {
                client: Some(Client {
                    name: "Acme Corp".to_string(),
                    email: "contact@acme.com".to_string(),
                    ..Default::default()
                }),
                ..Default::default()
            },
            None,
        )
        .await;
}
