use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .user
        .createusernamewithreferencedtype(
            &CreateUsernameBody {
                tags: vec![Some("tags".to_string())],
                username: "username".to_string(),
                password: "password".to_string(),
                name: "name".to_string(),
            },
            None,
        )
        .await;
}
