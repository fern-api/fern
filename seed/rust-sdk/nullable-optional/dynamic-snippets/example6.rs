use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .nullableoptional
        .createuser(
            &CreateUserRequest {
                username: "username".to_string(),
                email: None,
                phone: None,
                address: None,
            },
            None,
        )
        .await;
}
