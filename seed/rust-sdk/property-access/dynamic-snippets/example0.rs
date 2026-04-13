use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .create_user(
            &User {
                password: "password".to_string(),
                profile: UserProfile {
                    name: "name".to_string(),
                    verification: UserProfileVerification {
                        ..Default::default()
                    },
                    ssn: "ssn".to_string(),
                    ..Default::default()
                },
                ..Default::default()
            },
            None,
        )
        .await;
}
