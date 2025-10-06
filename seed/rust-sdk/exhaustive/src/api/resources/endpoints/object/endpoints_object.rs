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

    pub async fn get_and_return_with_optional_field(
        &self,
        request: &TypesObjectObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectObjectWithOptionalField, ApiError> {
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
        request: &TypesObjectObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectObjectWithRequiredField, ApiError> {
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
        request: &TypesObjectObjectWithMapOfMap,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectObjectWithMapOfMap, ApiError> {
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
        request: &TypesObjectNestedObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectNestedObjectWithOptionalField, ApiError> {
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
        request: &TypesObjectNestedObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectNestedObjectWithRequiredField, ApiError> {
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
        request: &Vec<TypesObjectNestedObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectNestedObjectWithRequiredField, ApiError> {
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
}
