use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct SimpleClient {
    pub http_client: HttpClient,
}

impl SimpleClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn foo_without_endpoint_error(&self, request: &FooRequest, options: Option<RequestOptions>) -> Result<FooResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "foo1",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn foo(&self, request: &FooRequest, options: Option<RequestOptions>) -> Result<FooResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "foo2",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn foo_with_examples(&self, request: &FooRequest, options: Option<RequestOptions>) -> Result<FooResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "foo3",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

