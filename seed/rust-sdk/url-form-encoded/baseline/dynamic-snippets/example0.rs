use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .submit_form_data(
            &PostSubmitRequest {
                username: "johndoe".to_string(),
                email: "john@example.com".to_string(),
            },
            None,
        )
        .await;
}
