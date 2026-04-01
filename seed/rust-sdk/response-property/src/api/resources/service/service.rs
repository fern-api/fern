use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
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

    pub async fn get_movie(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
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
    pub async fn get_movie_with_raw_response(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Response>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_movie_docs(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
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
    pub async fn get_movie_docs_with_raw_response(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Response>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_movie_name(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<StringResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
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
    pub async fn get_movie_name_with_raw_response(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<StringResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_movie_metadata(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
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
    pub async fn get_movie_metadata_with_raw_response(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Response>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_optional_movie(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Option<Response>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
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
    pub async fn get_optional_movie_with_raw_response(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Option<Response>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_optional_movie_docs(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<OptionalWithDocs, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
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
    pub async fn get_optional_movie_docs_with_raw_response(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<OptionalWithDocs>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_optional_movie_name(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<OptionalStringResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
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
    pub async fn get_optional_movie_name_with_raw_response(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<OptionalStringResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
