use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UnionClient {
    pub http_client: HttpClient,
}

impl UnionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get(&self, request: &MyUnion, options: Option<RequestOptions>) -> Result<MyUnion, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_metadata(&self, options: Option<RequestOptions>) -> Result<Metadata, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/metadata",
            None,
            None,
            options,
        ).await
    }

    pub async fn update_metadata(&self, request: &MetadataUnion, options: Option<RequestOptions>) -> Result<bool, ApiError> {
        self.http_client.execute_request(
            Method::PUT,
            "/metadata",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn call(&self, request: &Request, options: Option<RequestOptions>) -> Result<bool, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/call",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn duplicate_types_union(&self, request: &UnionWithDuplicateTypes, options: Option<RequestOptions>) -> Result<UnionWithDuplicateTypes, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/duplicate",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn nested_unions(&self, request: &NestedUnionRoot, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/nested",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

