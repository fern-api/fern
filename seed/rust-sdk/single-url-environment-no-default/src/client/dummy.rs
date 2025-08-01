use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct DummyClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl DummyClient {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn get_dummy(&self, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "dummy",
            None,
            None,
            options,
        ).await
    }

}

