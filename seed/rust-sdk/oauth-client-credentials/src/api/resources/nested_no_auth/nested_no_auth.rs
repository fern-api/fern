use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct NestedNoAuthClient {
    pub http_client: HttpClient,
    pub api: NestedNoAuthApiClient,
}

impl NestedNoAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            api: NestedNoAuthApiClient::new(config.clone())?,
        })
    }
}
