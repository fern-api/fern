use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
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

    pub async fn getmovie(
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

    pub async fn getmoviedocs(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie/docs",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn getmoviename(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<StringResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie/name",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn getmoviemetadata(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie/metadata",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn getoptionalmovie(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie/optional",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn getoptionalmoviedocs(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<OptionalWithDocs, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie/optional/docs",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn getoptionalmoviename(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<OptionalStringResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie/optional/name",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
