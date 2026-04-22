use crate::{ApiError, ByteStream, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get(&self, options: Option<RequestOptions>) -> Result<ByteStream, ApiError> {
        self.http_client
            .execute_stream_request(Method::GET, "/helloworld.txt", None, None, options)
            .await
    }
}
