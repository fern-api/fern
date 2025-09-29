use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct UnknownClient {
    pub http_client: HttpClient,
}

impl UnknownClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

}

