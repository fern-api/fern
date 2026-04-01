use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
use reqwest::Method;

pub mod metadata;
pub use metadata::MetadataClient;
pub struct EventsClient {
    pub http_client: HttpClient,
    pub metadata: MetadataClient,
}

impl EventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            metadata: MetadataClient::new(config.clone())?,
        })
    }

    /// List all user events.
    ///
    /// # Arguments
    ///
    /// * `limit` - The maximum number of results to return.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn list_events(
        &self,
        request: &ListEventsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Event>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users/events/",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }

    /// List all user events.
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `limit` - The maximum number of results to return.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn list_events_with_raw_response(
        &self,
        request: &ListEventsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<Event>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users/events/",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
