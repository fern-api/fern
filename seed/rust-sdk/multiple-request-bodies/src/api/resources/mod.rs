//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn upload_json_document(
        &self,
        request: &UploadDocumentRequest,
        options: Option<RequestOptions>,
    ) -> Result<UploadDocumentResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "documents/upload",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn upload_pdf_document(
        &self,
        request: &Vec<u8>,
        options: Option<RequestOptions>,
    ) -> Result<UploadDocumentResponse, ApiError> {
        self.http_client
            .execute_bytes_request(
                Method::POST,
                "documents/upload",
                Some(request.to_vec()),
                None,
                options,
            )
            .await
    }
}
