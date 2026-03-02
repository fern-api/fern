use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ObjectClient {
    pub http_client: HttpClient,
}

impl ObjectClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_and_return_with_optional_field(
        &self,
        request: &ObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-optional-field",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_with_required_field(
        &self,
        request: &ObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-required-field",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_with_map_of_map(
        &self,
        request: &ObjectWithMapOfMap,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithMapOfMap, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-map-of-map",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_nested_with_optional_field(
        &self,
        request: &NestedObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<NestedObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-nested-with-optional-field",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_nested_with_required_field(
        &self,
        string: &String,
        request: &NestedObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<NestedObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/object/get-and-return-nested-with-required-field/{}",
                    string
                ),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_nested_with_required_field_as_list(
        &self,
        request: &Vec<NestedObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<NestedObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-nested-with-required-field-list",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_with_unknown_field(
        &self,
        request: &ObjectWithUnknownField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithUnknownField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-unknown-field",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_and_return_with_datetime_like_string(
        &self,
        request: &ObjectWithDatetimeLikeString,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithDatetimeLikeString, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-datetime-like-string",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
