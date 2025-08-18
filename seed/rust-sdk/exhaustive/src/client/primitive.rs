use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PrimitiveClient {
    pub http_client: HttpClient,
}

impl PrimitiveClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_and_return_string(&self, request: &String, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/primitive/string",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_and_return_int(&self, request: &i32, options: Option<RequestOptions>) -> Result<i32, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/primitive/integer",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_and_return_long(&self, request: &i64, options: Option<RequestOptions>) -> Result<i64, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/primitive/long",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_and_return_double(&self, request: &f64, options: Option<RequestOptions>) -> Result<f64, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/primitive/double",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_and_return_bool(&self, request: &bool, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/primitive/boolean",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_and_return_datetime(&self, request: &chrono::DateTime<chrono::Utc>, options: Option<RequestOptions>) -> Result<chrono::DateTime<chrono::Utc>, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/primitive/datetime",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_and_return_date(&self, request: &chrono::NaiveDate, options: Option<RequestOptions>) -> Result<chrono::NaiveDate, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/primitive/date",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_and_return_uuid(&self, request: &uuid::Uuid, options: Option<RequestOptions>) -> Result<uuid::Uuid, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/primitive/uuid",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_and_return_base_64(&self, request: &String, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/primitive/base64",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

