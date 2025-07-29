use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct NullableClient {
    pub http_client: HttpClient,
}

impl NullableClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_users(&self, usernames: Option<&Option<String>>, avatar: Option<&Option<String>>, activated: Option<&Option<bool>>, tags: Option<&Option<Option<String>>>, extra: Option<&Option<Option<bool>>>, options: Option<RequestOptions>) -> Result<Vec<User>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn create_user(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn delete_user(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::DELETE,
            "/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

