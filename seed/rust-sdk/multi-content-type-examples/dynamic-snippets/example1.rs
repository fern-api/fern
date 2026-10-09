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
                    name: "name".to_string(),
                    email: "email".to_string(),
                    ..Default::default()
                }),
                ..Default::default()
            },
            None,
        )
        .await;
}
