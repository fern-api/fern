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

    pub async fn find(&self, optional_string: Option<OptionalString>, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<ImportingType, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            Some(serde_json::to_value(request).unwrap_or_default()),
            {
            let mut query_params = Vec::new();
            if let Some(value) = optional_string {
                query_params.push(("optionalString".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

