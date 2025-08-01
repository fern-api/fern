use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct ServiceClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl ServiceClient {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn endpoint(&self, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::DELETE,
            "/container/",
            None,
            None,
            options,
        ).await
    }

}

