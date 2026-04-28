use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .team_member
        .update_team_member(
            &"team_member_id".to_string(),
            &UpdateTeamMemberRequest {
                given_name: Some("given_name".to_string()),
                family_name: Some("family_name".to_string()),
                email_address: Some("email_address".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
