use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct TestGroupClient {
    pub http_client: HttpClient,
}

impl TestGroupClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Post a nullable request body
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn test_method_name(
        &self,
        path_param: &str,
        request: &TestMethodNameRequest,
        options: Option<RequestOptions>,
    ) -> Result<serde_json::Value, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("optional-request-body/{}", path_param),
                Some(serde_json::to_value(&request.body).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .serialize("query_param_object", request.query_param_object.clone())
                    .serialize("query_param_integer", request.query_param_integer.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Post a nullable request body
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
    pub async fn test_method_name_with_raw_response(
        &self,
        path_param: &str,
        request: &TestMethodNameRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<serde_json::Value>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                &format!("optional-request-body/{}", path_param),
                Some(serde_json::to_value(&request.body).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .serialize("query_param_object", request.query_param_object.clone())
                    .serialize("query_param_integer", request.query_param_integer.clone())
                    .build(),
                options,
            )
            .await
    }
}
