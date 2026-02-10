use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, QueryBuilder};
use reqwest::{Method};
use crate::api::{*};

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn head(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::HEAD,
            "/users",
            None,
            None,
            options,
        ).await
    }

    pub async fn list(&self, request: &ListQueryRequest, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            QueryBuilder::new().int("limit", request.limit.clone())
            .build(),
            options,
        ).await
    }

}

