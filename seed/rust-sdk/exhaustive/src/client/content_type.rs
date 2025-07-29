use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ContentTypeClient {
    pub http_client: HttpClient,
}

impl ContentTypeClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn post_json_patch_content_type(&self, request: &ObjectWithOptionalField, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/foo/bar",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn post_json_patch_content_with_charset_type(&self, request: &ObjectWithOptionalField, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/foo/baz",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

