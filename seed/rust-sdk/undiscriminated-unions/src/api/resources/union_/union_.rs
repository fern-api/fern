use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct UnionClient {
    pub http_client: HttpClient,
}

impl UnionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get(
        &self,
        request: &MyUnion,
        options: Option<RequestOptions>,
    ) -> Result<MyUnion, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
        request: &MyUnion,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<MyUnion>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_metadata(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Metadata, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/metadata", None, None, options)
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
    pub async fn get_metadata_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Metadata>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "/metadata", None, None, options)
            .await
    }

    pub async fn update_metadata(
        &self,
        request: &MetadataUnion,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                "/metadata",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
    pub async fn update_metadata_with_raw_response(
        &self,
        request: &MetadataUnion,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<bool>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::PUT,
                "/metadata",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn call(
        &self,
        request: &Request,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/call",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
    pub async fn call_with_raw_response(
        &self,
        request: &Request,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<bool>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/call",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn duplicate_types_union(
        &self,
        request: &UnionWithDuplicateTypes,
        options: Option<RequestOptions>,
    ) -> Result<UnionWithDuplicateTypes, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/duplicate",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
    pub async fn duplicate_types_union_with_raw_response(
        &self,
        request: &UnionWithDuplicateTypes,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<UnionWithDuplicateTypes>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/duplicate",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn nested_unions(
        &self,
        request: &NestedUnionRoot,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/nested",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
    pub async fn nested_unions_with_raw_response(
        &self,
        request: &NestedUnionRoot,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<String>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/nested",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn test_camel_case_properties(
        &self,
        request: &PaymentRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/camel-case",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
    pub async fn test_camel_case_properties_with_raw_response(
        &self,
        request: &PaymentRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<String>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/camel-case",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
