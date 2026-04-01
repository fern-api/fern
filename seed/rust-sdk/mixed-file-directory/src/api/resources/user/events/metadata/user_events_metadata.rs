use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
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

    /// Get event metadata.
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_metadata_with_raw_response(
        &self,
        request: &GetMetadataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Metadata>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
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
