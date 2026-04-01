use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct PlantsClient {
    pub http_client: HttpClient,
}

impl PlantsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn list(&self, options: Option<RequestOptions>) -> Result<Vec<Plant>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "plants", None, None, options)
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
    pub async fn list_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<Plant>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "plants", None, None, options)
            .await
    }

    pub async fn get(
        &self,
        plant_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Plant, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("plants/{}", plant_id),
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
    pub async fn get_with_raw_response(
        &self,
        plant_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Plant>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("plants/{}", plant_id),
                None,
                None,
                options,
            )
            .await
    }
}
