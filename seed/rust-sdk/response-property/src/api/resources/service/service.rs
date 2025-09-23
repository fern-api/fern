use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
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
        request: &String,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_movie_docs(
        &self,
        request: &String,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_movie_name(
        &self,
        request: &String,
        options: Option<RequestOptions>,
    ) -> Result<StringResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_movie_metadata(
        &self,
        request: &String,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_optional_movie(
        &self,
        request: &String,
        options: Option<RequestOptions>,
    ) -> Result<Option<Response>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_optional_movie_docs(
        &self,
        request: &String,
        options: Option<RequestOptions>,
    ) -> Result<OptionalWithDocs, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_optional_movie_name(
        &self,
        request: &String,
        options: Option<RequestOptions>,
    ) -> Result<OptionalStringResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
