use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct BigunionClient {
    pub http_client: HttpClient,
}

impl BigunionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get(&self, id: &String, options: Option<RequestOptions>) -> Result<BigUnion, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}", id),
            None,
            None,
            options,
        ).await
    }

    pub async fn update(&self, request: &BigUnion, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::PATCH,
            "",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn update_many(&self, request: &Vec<BigUnion>, options: Option<RequestOptions>) -> Result<HashMap<String, bool>, ClientError> {
        self.http_client.execute_request(
            Method::PATCH,
            "/many",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

