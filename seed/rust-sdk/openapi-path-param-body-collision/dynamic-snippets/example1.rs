use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .update_profile_identifier(
            &"profileId".to_string(),
            &"idTypePathParam".to_string(),
            &IdentifierUpdate {
                id_type: "idType".to_string(),
                old_value: "oldValue".to_string(),
                new_value: "newValue".to_string(),
            },
            None,
        )
        .await;
}
