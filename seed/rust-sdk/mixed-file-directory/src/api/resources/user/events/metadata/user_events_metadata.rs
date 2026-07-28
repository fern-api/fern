use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct MetadataClient {
    pub http_client: HttpClient,
}

impl MetadataClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Get event metadata.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_mixed_file_directory::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .events
    ///         .metadata
    ///         .get_metadata(
    ///             &GetMetadataQueryRequest {
    ///                 id: Id("id".to_string()),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_metadata(
        &self,
        request: &GetMetadataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Metadata, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users/events/metadata/",
                None,
                QueryBuilder::new()
                    .serialize("id", Some(request.id.clone()))
                    .build(),
                options,
            )
            .await
    }
}
