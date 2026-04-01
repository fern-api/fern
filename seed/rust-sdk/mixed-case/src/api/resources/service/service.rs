use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_resource(
        &self,
        resource_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Resource, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/resource/{}", resource_id),
                None,
                None,
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
    pub async fn get_resource_with_raw_response(
        &self,
        resource_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Resource>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("/resource/{}", resource_id),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn list_resources(
        &self,
        request: &ListResourcesQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Resource>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/resource",
                None,
                QueryBuilder::new()
                    .int("page_limit", request.page_limit.clone())
                    .date("beforeDate", request.before_date.clone())
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
    pub async fn list_resources_with_raw_response(
        &self,
        request: &ListResourcesQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<Resource>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/resource",
                None,
                QueryBuilder::new()
                    .int("page_limit", request.page_limit.clone())
                    .date("beforeDate", request.before_date.clone())
                    .build(),
                options,
            )
            .await
    }
}
