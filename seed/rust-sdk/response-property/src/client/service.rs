use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_movie(&self, request: &String, options: Option<RequestOptions>) -> Result<Response, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_movie_docs(&self, request: &String, options: Option<RequestOptions>) -> Result<Response, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_movie_name(&self, request: &String, options: Option<RequestOptions>) -> Result<StringResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_movie_metadata(&self, request: &String, options: Option<RequestOptions>) -> Result<Response, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_optional_movie(&self, request: &String, options: Option<RequestOptions>) -> Result<Option<Response>, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_optional_movie_docs(&self, request: &String, options: Option<RequestOptions>) -> Result<OptionalWithDocs, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_optional_movie_name(&self, request: &String, options: Option<RequestOptions>) -> Result<OptionalStringResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

