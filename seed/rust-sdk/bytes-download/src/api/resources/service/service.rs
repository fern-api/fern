use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, ByteStream};
use reqwest::{Method};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn simple(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "snippet",
            None,
            None,
            options,
        ).await
    }

    pub async fn download(&self, id: &String, options: Option<RequestOptions>) -> Result<ByteStream, ApiError> {
        self.http_client.execute_stream_request(
            Method::GET,
            &format!("download-content/{}", id),
            None,
            None,
            options,
        ).await
    }

}

