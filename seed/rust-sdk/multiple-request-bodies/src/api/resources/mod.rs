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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .upload_json_document(
    ///             &UploadDocumentRequest {
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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
