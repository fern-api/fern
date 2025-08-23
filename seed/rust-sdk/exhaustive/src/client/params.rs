use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ParamsClient {
    pub http_client: HttpClient,
}

impl ParamsClient {
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
            {
            let mut query_builder = crate::QueryParameterBuilder::new();
            if let Some(value) = query {
                // Try to parse as structured query, fall back to simple if it fails
                if let Err(_) = query_builder.add_structured_query(&value) {
                    query_builder.add_simple("query", &value);
                }
            }
            if let Some(value) = number {
                query_builder.add_simple("number", &value.to_string());
            }
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        },
            options,
        ).await
    }

    pub async fn get_with_allow_multiple_query(&self, query: Option<String>, number: Option<i32>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/params",
            None,
            {
            let mut query_builder = crate::QueryParameterBuilder::new();
            if let Some(value) = query {
                // Try to parse as structured query, fall back to simple if it fails
                if let Err(_) = query_builder.add_structured_query(&value) {
                    query_builder.add_simple("query", &value);
                }
            }
            if let Some(value) = number {
                query_builder.add_simple("number", &value.to_string());
            }
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        },
            options,
        ).await
    }

    pub async fn get_with_path_and_query(&self, param: &String, query: Option<String>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path-query/{}", param),
            None,
            {
            let mut query_builder = crate::QueryParameterBuilder::new();
            if let Some(value) = query {
                // Try to parse as structured query, fall back to simple if it fails
                if let Err(_) = query_builder.add_structured_query(&value) {
                    query_builder.add_simple("query", &value);
                }
            }
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        },
            options,
        ).await
    }

    pub async fn get_with_inline_path_and_query(&self, param: &String, query: Option<String>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path-query/{}", param),
            None,
            {
            let mut query_builder = crate::QueryParameterBuilder::new();
            if let Some(value) = query {
                // Try to parse as structured query, fall back to simple if it fails
                if let Err(_) = query_builder.add_structured_query(&value) {
                    query_builder.add_simple("query", &value);
                }
            }
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        },
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

