use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_direct_thread(&self, options: Option<RequestOptions>) -> Result<Response, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/partner-path",
            None,
            None,
            options,
        ).await
    }

}

