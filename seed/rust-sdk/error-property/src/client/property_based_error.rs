use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PropertyBasedErrorClient {
    pub http_client: HttpClient,
}

impl PropertyBasedErrorClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn throw_error(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "property-based-error",
            None,
            None,
            options,
        ).await
    }

}

