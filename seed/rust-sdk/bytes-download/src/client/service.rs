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

    pub async fn download(&self, id: &String, options: Option<RequestOptions>) -> Result<Vec<u8>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("download-content/{}", id),
            None,
            None,
            options,
        ).await
    }

}

