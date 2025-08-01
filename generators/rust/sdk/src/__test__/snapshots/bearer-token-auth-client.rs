use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct UserClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl UserClient {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn get_user(&self, id: &String, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/users/{id}{}", id),
            None,
            None,
            options,
        ).await
    }

}

