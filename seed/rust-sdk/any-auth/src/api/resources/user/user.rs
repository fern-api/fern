use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
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

    pub async fn get(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "users",
            None,
            None,
            options,
        ).await
    }

    pub async fn get_admins(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "admins",
            None,
            None,
            options,
        ).await
    }

}

