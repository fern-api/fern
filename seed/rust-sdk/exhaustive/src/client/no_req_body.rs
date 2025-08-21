use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct NoReqBodyClient {
    pub http_client: HttpClient,
}

impl NoReqBodyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_with_no_request_body(&self, options: Option<RequestOptions>) -> Result<ObjectWithOptionalField, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/no-req-body",
            None,
            None,
            options,
        ).await
    }

    pub async fn post_with_no_request_body(&self, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/no-req-body",
            None,
            None,
            options,
        ).await
    }

}

