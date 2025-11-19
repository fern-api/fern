use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
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
        id: &String,
        options: Option<RequestOptions>,
    ) -> Result<Shape, ApiError> {
        self.http_client
            .execute_request(Method::GET, &format!("/{}", id), None, None, options)
            .await
    }

    pub async fn update(
        &self,
        request: &Shape,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
