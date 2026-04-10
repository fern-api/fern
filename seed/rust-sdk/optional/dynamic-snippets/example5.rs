use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .optional
        .sendoptionalnullablewithalloptionalproperties(
            &"actionId".to_string(),
            &"id".to_string(),
            &DeployParams {
                update_draft: Some(true),
                ..Default::default()
            },
            None,
        )
        .await;
}
