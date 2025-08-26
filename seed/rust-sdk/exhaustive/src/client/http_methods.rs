use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct HttpMethodsClient {
    pub http_client: HttpClient,
}

impl HttpMethodsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn test_get(&self, id: &String, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/http-methods/{}", id),
            None,
            None,
            options,
        ).await
    }

    pub async fn test_post(&self, request: &ObjectWithRequiredField, options: Option<RequestOptions>) -> Result<ObjectWithOptionalField, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/http-methods",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn test_put(&self, id: &String, request: &ObjectWithRequiredField, options: Option<RequestOptions>) -> Result<ObjectWithOptionalField, ClientError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("/http-methods/{}", id),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn test_patch(&self, id: &String, request: &ObjectWithOptionalField, options: Option<RequestOptions>) -> Result<ObjectWithOptionalField, ClientError> {
        self.http_client.execute_request(
            Method::PATCH,
            &format!("/http-methods/{}", id),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn test_delete(&self, id: &String, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/http-methods/{}", id),
            None,
            None,
            options,
        ).await
    }

}

