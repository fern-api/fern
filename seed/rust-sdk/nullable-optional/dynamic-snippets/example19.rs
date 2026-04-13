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
        .filterbyrole(
            &FilterbyroleQueryRequest {
                role: UserRole::Admin,
                status: Some(UserStatus::Active),
                secondary_role: Some(UserRole::Admin),
            },
            None,
        )
        .await;
}
