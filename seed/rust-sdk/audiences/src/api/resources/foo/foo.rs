use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct FooClient {
    pub http_client: HttpClient,
}

impl FooClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn find(
        &self,
        request: &FindRequest,
        options: Option<RequestOptions>,
    ) -> Result<ImportingType, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .serialize("optionalString", Some(request.optional_string.clone()))
                    .build(),
                options,
            )
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
    pub async fn find_with_raw_response(
        &self,
        request: &FindRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ImportingType>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .serialize("optionalString", Some(request.optional_string.clone()))
                    .build(),
                options,
            )
            .await
    }
}
