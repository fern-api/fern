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
            &"profile_123".to_string(),
            &"email".to_string(),
            &IdentifierUpdate {
                id_type: "phone".to_string(),
                old_value: "+13175556789".to_string(),
                new_value: "+13175556798".to_string(),
            },
            None,
        )
        .await;
}
