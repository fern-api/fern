use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct FooClient {
    pub http_client: HttpClient,
}

impl FooClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn find(&self, optional_string: Option<&OptionalString>, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<ImportingType, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

