use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;
use std::collections::HashMap;

pub struct SyspropClient {
    pub http_client: HttpClient,
}

impl SyspropClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn set_num_warm_instances(
        &self,
        language: &Language,
        num_warm_instances: i64,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!(
                    "/sysprop/num-warm-instances/{}/{}",
                    language, num_warm_instances
                ),
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
    pub async fn set_num_warm_instances_with_raw_response(
        &self,
        language: &Language,
        num_warm_instances: i64,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::PUT,
                &format!(
                    "/sysprop/num-warm-instances/{}/{}",
                    language, num_warm_instances
                ),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn get_num_warm_instances(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<HashMap<Language, i64>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/sysprop/num-warm-instances",
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
    pub async fn get_num_warm_instances_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<HashMap<Language, i64>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/sysprop/num-warm-instances",
                None,
                None,
                options,
            )
            .await
    }
}
