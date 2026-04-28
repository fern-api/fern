use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct TeamMemberClient {
    pub http_client: HttpClient,
}

impl TeamMemberClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn update_team_member(
        &self,
        team_member_id: &str,
        request: &UpdateTeamMemberRequest,
        options: Option<RequestOptions>,
    ) -> Result<TeamMember, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("team-members/{}", team_member_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
