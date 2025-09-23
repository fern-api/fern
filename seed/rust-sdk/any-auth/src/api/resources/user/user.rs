use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
        })
    }

    pub async fn get(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::POST, "users", None, None, options)
            .await
    }

    pub async fn get_admins(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "admins", None, None, options)
            .await
    }
}
