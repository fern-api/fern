use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct MigrationClient {
    pub http_client: HttpClient,
}

impl MigrationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_attempted_migrations(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Migration>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/migration-info/all", None, None, options)
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_attempted_migrations_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<Migration>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/migration-info/all",
                None,
                None,
                options,
            )
            .await
    }
}
