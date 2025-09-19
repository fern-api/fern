use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct EndpointsPutClient {
    pub http_client: HttpClient,
}

impl EndpointsPutClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn add(&self, id: &String, options: Option<RequestOptions>) -> Result<PutResponse, ApiError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("{}", id),
            None,
            None,
            options,
        ).await
    }

}

