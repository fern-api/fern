use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, QueryBuilder};
use reqwest::{Method};
use crate::api::{*};

pub struct UsersClient {
    pub http_client: HttpClient,
}

impl UsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn list_usernames_custom(&self, request: &ListUsernamesCustomQueryRequest, options: Option<RequestOptions>) -> Result<UsernameCursor, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            QueryBuilder::new().string("starting_after", request.starting_after.clone())
            .build(),
            options,
        ).await
    }

}

