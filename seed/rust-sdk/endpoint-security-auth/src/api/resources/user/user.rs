use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_with_bearer(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_api_key(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_o_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_any_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_all_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }
}
