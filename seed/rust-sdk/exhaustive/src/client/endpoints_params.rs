use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct EndpointsParamsClient {
    pub http_client: HttpClient,
}

impl EndpointsParamsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_with_path(&self, param: &String, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path/{}", param),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_with_inline_path(&self, param: &String, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path/{}", param),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_with_query(&self, query: Option<String>, number: Option<i32>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/params",
            None,
            QueryBuilder::new().structured_query("query", query).int("number", number)
            .build(),
            options,
        ).await
    }

    pub async fn get_with_allow_multiple_query(&self, query: Option<String>, number: Option<i32>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/params",
            None,
            QueryBuilder::new().structured_query("query", query).int("number", number)
            .build(),
            options,
        ).await
    }

    pub async fn get_with_path_and_query(&self, param: &String, query: Option<String>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path-query/{}", param),
            None,
            QueryBuilder::new().structured_query("query", query)
            .build(),
            options,
        ).await
    }

    pub async fn get_with_inline_path_and_query(&self, param: &String, query: Option<String>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path-query/{}", param),
            None,
            QueryBuilder::new().structured_query("query", query)
            .build(),
            options,
        ).await
    }

    pub async fn modify_with_path(&self, param: &String, request: &String, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("/params/path/{}", param),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn modify_with_inline_path(&self, param: &String, request: &String, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("/params/path/{}", param),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

