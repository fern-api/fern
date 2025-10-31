use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;
use std::collections::{HashMap, HashSet};

pub struct ContainerClient {
    pub http_client: HttpClient,
}

impl ContainerClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_and_return_list_of_primitives(
        &self,
        request: &Vec<String>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<String>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/container/list-of-primitives",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_list_of_objects(
        &self,
        request: &Vec<ObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<ObjectWithRequiredField>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/container/list-of-objects",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_set_of_primitives(
        &self,
        request: &HashSet<String>,
        options: Option<RequestOptions>,
    ) -> Result<HashSet<String>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/container/set-of-primitives",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_set_of_objects(
        &self,
        request: &HashSet<ObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<HashSet<ObjectWithRequiredField>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/container/set-of-objects",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_map_prim_to_prim(
        &self,
        request: &HashMap<String, String>,
        options: Option<RequestOptions>,
    ) -> Result<HashMap<String, String>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/container/map-prim-to-prim",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_map_of_prim_to_object(
        &self,
        request: &HashMap<String, ObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<HashMap<String, ObjectWithRequiredField>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/container/map-prim-to-object",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_and_return_optional(
        &self,
        request: &Option<ObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<Option<ObjectWithRequiredField>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/container/opt-objects",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
