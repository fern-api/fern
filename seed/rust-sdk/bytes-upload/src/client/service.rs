use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::core::{File};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn upload(&self, file_data: Vec<u8>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_bytes_request(
            Method::POST,
            "upload-content",
            file_data,
            None,
            options,
        ).await
    }

}

