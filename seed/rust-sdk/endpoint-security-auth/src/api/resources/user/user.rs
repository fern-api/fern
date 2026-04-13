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

    pub async fn getwithbearer(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users/bearer", None, None, options)
            .await
    }

    pub async fn getwithapikey(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users/api-key", None, None, options)
            .await
    }

    pub async fn getwithoauth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users/oauth", None, None, options)
            .await
    }

    pub async fn getwithbasic(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users/basic", None, None, options)
            .await
    }

    pub async fn getwithinferredauth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users/inferred", None, None, options)
            .await
    }

    pub async fn getwithanyauth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users/any", None, None, options)
            .await
    }

    pub async fn getwithallauth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users/all", None, None, options)
            .await
    }
}
