use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use chrono::{DateTime, FixedOffset, NaiveDate};
use reqwest::Method;
use uuid::Uuid;

pub struct PrimitiveClient {
    pub http_client: HttpClient,
}

impl PrimitiveClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_and_return_string(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/string",
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
    pub async fn get_and_return_string_with_raw_response(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<String>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/primitive/string",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_int(
        &self,
        request: &i64,
        options: Option<RequestOptions>,
    ) -> Result<i64, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/integer",
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
    pub async fn get_and_return_int_with_raw_response(
        &self,
        request: &i64,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<i64>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/primitive/integer",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_long(
        &self,
        request: &i64,
        options: Option<RequestOptions>,
    ) -> Result<i64, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/long",
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
    pub async fn get_and_return_long_with_raw_response(
        &self,
        request: &i64,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<i64>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/primitive/long",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_double(
        &self,
        request: &f64,
        options: Option<RequestOptions>,
    ) -> Result<f64, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/double",
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
    pub async fn get_and_return_double_with_raw_response(
        &self,
        request: &f64,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<f64>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/primitive/double",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_bool(
        &self,
        request: &bool,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/boolean",
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
    pub async fn get_and_return_bool_with_raw_response(
        &self,
        request: &bool,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<bool>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/primitive/boolean",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_datetime(
        &self,
        request: &DateTime<FixedOffset>,
        options: Option<RequestOptions>,
    ) -> Result<DateTime<FixedOffset>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/datetime",
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
    pub async fn get_and_return_datetime_with_raw_response(
        &self,
        request: &DateTime<FixedOffset>,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<DateTime<FixedOffset>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/primitive/datetime",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_date(
        &self,
        request: &NaiveDate,
        options: Option<RequestOptions>,
    ) -> Result<NaiveDate, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/date",
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
    pub async fn get_and_return_date_with_raw_response(
        &self,
        request: &NaiveDate,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<NaiveDate>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/primitive/date",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_uuid(
        &self,
        request: &Uuid,
        options: Option<RequestOptions>,
    ) -> Result<Uuid, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/uuid",
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
    pub async fn get_and_return_uuid_with_raw_response(
        &self,
        request: &Uuid,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Uuid>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/primitive/uuid",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_base_64(
        &self,
        request: &Vec<u8>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<u8>, ApiError> {
        self.http_client
            .execute_request_base64(
                Method::POST,
                "/primitive/base64",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
