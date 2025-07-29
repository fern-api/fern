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

    pub async fn simple(&self, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/snippet",
            None,
            options,
        ).await
    }

    pub async fn download_file(&self, options: Option<RequestOptions>) -> Result<Vec<u8>, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            None,
            options,
        ).await
    }

}

