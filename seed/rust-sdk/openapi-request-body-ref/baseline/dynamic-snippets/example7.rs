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
                ..Default::default()
            },
            None,
        )
        .await;
}
