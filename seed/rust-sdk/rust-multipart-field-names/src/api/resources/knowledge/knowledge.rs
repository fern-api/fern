use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct KnowledgeClient {
    pub http_client: HttpClient,
}

impl KnowledgeClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
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
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .knowledge
    ///         .upload_knowledge(
    ///             &UploadKnowledgeRequest {
    ///                 file0: b"test file content".to_vec(),
    ///                 file1: b"test file content".to_vec(),
    ///                 url_path: None,
    ///                 display_name2: None,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn upload_knowledge(
        &self,
        request: &UploadKnowledgeRequest,
        options: Option<RequestOptions>,
    ) -> Result<UploadKnowledgeResponse, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "knowledge",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }
}
