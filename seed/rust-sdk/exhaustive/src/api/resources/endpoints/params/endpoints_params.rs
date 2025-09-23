use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct EndpointsParamsClient {
    pub http_client: HttpClient,
}

impl EndpointsParamsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_with_path(
        &self,
        param: &String,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/params/path/{}", param),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn get_with_inline_path(
        &self,
        param: &String,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/params/path/{}", param),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn get_with_query(
        &self,
        request: &GetWithQueryQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/params",
                None,
                QueryBuilder::new()
                    .structured_query("query", request.query.clone())
                    .int("number", request.number.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_with_allow_multiple_query(
        &self,
        request: &GetWithAllowMultipleQueryQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/params",
                None,
                QueryBuilder::new()
                    .structured_query("query", request.query.clone())
                    .int("number", request.number.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_with_path_and_query(
        &self,
        param: &String,
        request: &GetWithPathAndQueryQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/params/path-query/{}", param),
                None,
                QueryBuilder::new()
                    .structured_query("query", request.query.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_with_inline_path_and_query(
        &self,
        param: &String,
        request: &GetWithInlinePathAndQueryQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/params/path-query/{}", param),
                None,
                QueryBuilder::new()
                    .structured_query("query", request.query.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn modify_with_path(
        &self,
        param: &String,
        request: &String,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("/params/path/{}", param),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn modify_with_inline_path(
        &self,
        param: &String,
        request: &String,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("/params/path/{}", param),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
