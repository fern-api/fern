use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct EndpointsObjectClient {
    pub http_client: HttpClient,
}

impl EndpointsObjectClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn endpoints_object_get_and_return_with_optional_field(
        &self,
        request: &TypesObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-with-optional-field",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_object_get_and_return_with_required_field(
        &self,
        request: &TypesObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-with-required-field",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_object_get_and_return_with_map_of_map(
        &self,
        request: &TypesObjectWithMapOfMap,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithMapOfMap, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-with-map-of-map",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_object_get_and_return_nested_with_optional_field(
        &self,
        request: &TypesNestedObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<TypesNestedObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-nested-with-optional-field",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_object_get_and_return_nested_with_required_field(
        &self,
        string: &str,
        request: &TypesNestedObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<TypesNestedObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "object/get-and-return-nested-with-required-field/{}",
                    string
                ),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_object_get_and_return_nested_with_required_field_as_list(
        &self,
        request: &Vec<TypesNestedObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<TypesNestedObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-nested-with-required-field-list",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_object_get_and_return_with_unknown_field(
        &self,
        request: &TypesObjectWithUnknownField,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithUnknownField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-with-unknown-field",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_object_get_and_return_with_documented_unknown_type(
        &self,
        request: &TypesObjectWithDocumentedUnknownType,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithDocumentedUnknownType, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-with-documented-unknown-type",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_object_get_and_return_map_of_documented_unknown_type(
        &self,
        request: &TypesMapOfDocumentedUnknownType,
        options: Option<RequestOptions>,
    ) -> Result<TypesMapOfDocumentedUnknownType, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-map-of-documented-unknown-type",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Tests that dynamic snippets include all required properties in the
    /// object initializer, even when the example omits some required fields.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn endpoints_object_get_and_return_with_mixed_required_and_optional_fields(
        &self,
        request: &TypesObjectWithMixedRequiredAndOptionalFields,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithMixedRequiredAndOptionalFields, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-with-mixed-required-and-optional-fields",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Tests that dynamic snippets recursively construct default objects for
    /// required properties whose type is a named object. When the example
    /// omits the nested object, the generator should construct a default
    /// initializer with the nested object's required properties filled in.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn endpoints_object_get_and_return_with_required_nested_object(
        &self,
        request: &TypesObjectWithRequiredNestedObject,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithRequiredNestedObject, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-with-required-nested-object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
    pub async fn endpoints_object_get_and_return_with_datetime_like_string(
        &self,
        request: &TypesObjectWithDatetimeLikeString,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithDatetimeLikeString, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "object/get-and-return-with-datetime-like-string",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
