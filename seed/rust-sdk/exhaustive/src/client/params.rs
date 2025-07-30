use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ParamsClient {
    pub http_client: HttpClient,
}

impl ParamsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_with_path(&self, param: &String, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path/{}", param),
            None,
            options,
        ).await
    }

    pub async fn get_with_inline_path(&self, param: &String, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path/{}", param),
            None,
            options,
        ).await
    }

    pub async fn get_with_query(&self, query: Option<&String>, number: Option<i32>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/params",
            None,
            options,
        ).await
    }

    pub async fn get_with_allow_multiple_query(&self, query: Option<&String>, number: Option<i32>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/params",
            None,
            options,
        ).await
    }

    pub async fn get_with_path_and_query(&self, param: &String, query: Option<&String>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path-query/{}", param),
            None,
            options,
        ).await
    }

    pub async fn get_with_inline_path_and_query(&self, param: &String, query: Option<&String>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/params/path-query/{}", param),
            None,
            options,
        ).await
    }

    pub async fn modify_with_path(&self, param: &String, request: &String, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("/params/path/{}", param),
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn modify_with_inline_path(&self, param: &String, request: &String, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("/params/path/{}", param),
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

