use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn head(&self, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::HEAD,
            "/users",
            None,
            None,
            options,
        ).await
    }

    pub async fn list(&self, limit: Option<i32>, options: Option<RequestOptions>) -> Result<Vec<User>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = limit {
                query_params.push(("limit".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

