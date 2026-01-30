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

    pub async fn get_user(&self, user_id: &UserId, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/users/{}", user_id.0),
            None,
            None,
            options,
        ).await
    }

}

