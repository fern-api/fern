use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
use reqwest::Method;

pub mod events;
pub use events::EventsClient;
pub struct UserClient {
    pub http_client: HttpClient,
    pub events: EventsClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            events: EventsClient::new(config.clone())?,
        })
    }

    /// List all users.
    ///
    /// # Arguments
    ///
    /// * `limit` - The maximum number of results to return.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn list(
        &self,
        request: &ListQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users/",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }

    /// List all users.
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
    pub async fn list_with_raw_response(
        &self,
        request: &ListQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users/",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
