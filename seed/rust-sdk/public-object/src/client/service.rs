use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get(&self, options: Option<RequestOptions>) -> Result<Vec<u8>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/helloworld.txt",
            None,
            options,
        ).await
    }

}

