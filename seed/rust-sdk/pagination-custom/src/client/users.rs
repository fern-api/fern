use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UsersClient {
    pub http_client: HttpClient,
}

impl UsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn list_usernames_custom(&self, starting_after: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<UsernameCursor, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

}

