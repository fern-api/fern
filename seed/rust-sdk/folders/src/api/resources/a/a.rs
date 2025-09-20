use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::api::types::{*};

pub struct AClient {
    pub http_client: HttpClient,
    pub b: ABClient,
    pub c: ACClient,
}

impl AClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config)?,
    b: ABClient::new(config.clone())?,
    c: ACClient::new(config.clone())?
})
    }

}

