use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UnionClient {
    pub http_client: HttpClient,
}

impl UnionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get(
        &self,
        request: &UnionMyUnion,
        options: Option<RequestOptions>,
    ) -> Result<UnionMyUnion, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_metadata(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<UnionMetadata, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/metadata", None, None, options)
            .await
    }

    pub async fn update_metadata(
        &self,
        request: &UnionMetadataUnion,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                "/metadata",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn call(
        &self,
        request: &UnionRequest,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/call",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn duplicate_types_union(
        &self,
        request: &UnionUnionWithDuplicateTypes,
        options: Option<RequestOptions>,
    ) -> Result<UnionUnionWithDuplicateTypes, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/duplicate",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn nested_unions(
        &self,
        request: &UnionNestedUnionRoot,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/nested",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
