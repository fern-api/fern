use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File, FormDataBuilder};

pub struct PropertyBasedErrorClient {
    pub http_client: HttpClient,
}

impl PropertyBasedErrorClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn throw_error(&self, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "property-based-error",
            None,
            None,
            options,
        ).await
    }

}

