use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct InlinedRequestsClient {
    pub http_client: HttpClient,
}

impl InlinedRequestsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn post_with_object_bodyand_response(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<ObjectWithOptionalField, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/req-bodies/object",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

