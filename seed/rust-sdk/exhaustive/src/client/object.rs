use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ObjectClient {
    pub http_client: HttpClient,
}

impl ObjectClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_and_return_with_optional_field(&self, request: &ObjectWithOptionalField, options: Option<RequestOptions>) -> Result<ObjectWithOptionalField, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/object/get-and-return-with-optional-field",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn get_and_return_with_required_field(&self, request: &ObjectWithRequiredField, options: Option<RequestOptions>) -> Result<ObjectWithRequiredField, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/object/get-and-return-with-required-field",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn get_and_return_with_map_of_map(&self, request: &ObjectWithMapOfMap, options: Option<RequestOptions>) -> Result<ObjectWithMapOfMap, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/object/get-and-return-with-map-of-map",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn get_and_return_nested_with_optional_field(&self, request: &NestedObjectWithOptionalField, options: Option<RequestOptions>) -> Result<NestedObjectWithOptionalField, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/object/get-and-return-nested-with-optional-field",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn get_and_return_nested_with_required_field(&self, string: &String, request: &NestedObjectWithRequiredField, options: Option<RequestOptions>) -> Result<NestedObjectWithRequiredField, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/object/get-and-return-nested-with-required-field/{}", string),
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn get_and_return_nested_with_required_field_as_list(&self, request: &Vec<NestedObjectWithRequiredField>, options: Option<RequestOptions>) -> Result<NestedObjectWithRequiredField, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/object/get-and-return-nested-with-required-field-list",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

