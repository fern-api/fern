use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};

pub struct Client {
    pub http_client: HttpClient,
}

impl Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config)?
})
    }

    pub async fn get_user(&self, id: &String, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/users/{id}{}", id),
            None,
            None,
            options,
        ).await
    }

}

