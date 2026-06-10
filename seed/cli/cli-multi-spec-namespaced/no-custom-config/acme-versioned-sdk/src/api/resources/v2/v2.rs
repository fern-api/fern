use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct V2Client {
    pub http_client: HttpClient,
}

impl V2Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn list_users(
        &self,
        request: &ListUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserV2>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users",
                None,
                QueryBuilder::new()
                    .int("pageSize", request.page_size.clone())
                    .build(),
                options,
            )
            .await
    }
}
