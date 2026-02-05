use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct NoReqBodyClient {
    pub http_client: HttpClient,
}

impl NoReqBodyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn get_with_no_request_body(&self, options: Option<RequestOptions>) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/no-req-body",
            None,
            None,
            options,
        ).await
    }

    pub async fn post_with_no_request_body(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/no-req-body",
            None,
            None,
            options,
        ).await
    }

}

