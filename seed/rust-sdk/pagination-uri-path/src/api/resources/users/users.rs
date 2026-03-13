use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UsersClient {
    pub http_client: HttpClient,
}

impl UsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn list_with_uri_pagination(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersUriPaginationResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/users/uri", None, None, options)
            .await
    }

    pub async fn list_with_path_pagination(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPathPaginationResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/users/path", None, None, options)
            .await
    }
}
