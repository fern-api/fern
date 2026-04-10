use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;
use std::collections::HashMap;

pub struct EndpointsContainerClient {
    pub http_client: HttpClient,
}

impl EndpointsContainerClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn endpoints_container_get_and_return_list_of_primitives(
        &self,
        request: &Vec<String>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<String>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "container/list-of-primitives",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_container_get_and_return_list_of_objects(
        &self,
        request: &Vec<TypesObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<TypesObjectWithRequiredField>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "container/list-of-objects",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_container_get_and_return_set_of_primitives(
        &self,
        request: &Vec<String>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<String>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "container/set-of-primitives",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_container_get_and_return_set_of_objects(
        &self,
        request: &Vec<TypesObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<TypesObjectWithRequiredField>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "container/set-of-objects",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_container_get_and_return_map_prim_to_prim(
        &self,
        request: &HashMap<String, String>,
        options: Option<RequestOptions>,
    ) -> Result<HashMap<String, String>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "container/map-prim-to-prim",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_container_get_and_return_map_of_prim_to_object(
        &self,
        request: &HashMap<String, TypesObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<HashMap<String, TypesObjectWithRequiredField>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "container/map-prim-to-object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_container_get_and_return_map_of_prim_to_undiscriminated_union(
        &self,
        request: &HashMap<String, TypesMixedType>,
        options: Option<RequestOptions>,
    ) -> Result<HashMap<String, TypesMixedType>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "container/map-prim-to-union",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn endpoints_container_get_and_return_optional(
        &self,
        request: &TypesObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "container/opt-objects",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
