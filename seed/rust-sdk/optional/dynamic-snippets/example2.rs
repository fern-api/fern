use seed_objects_with_imports::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ObjectsWithImportsClient::new(config).expect("Failed to build client");
    client
        .optional
        .send_optional_nullable_with_all_optional_properties(
            &"actionId".to_string(),
            &"id".to_string(),
            &Some(Some(DeployParams {
                update_draft: Some(true),
            })),
            None,
        )
        .await;
}
