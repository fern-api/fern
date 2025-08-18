use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File, FormDataBuilder};

pub struct UrlsClient {
    pub http_client: HttpClient,
}

impl UrlsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn with_mixed_case(&self, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/urls/MixedCase",
            None,
            None,
            options,
        ).await
    }

    pub async fn no_ending_slash(&self, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/urls/no-ending-slash",
            None,
            None,
            options,
        ).await
    }

    pub async fn with_ending_slash(&self, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/urls/with-ending-slash/",
            None,
            None,
            options,
        ).await
    }

    pub async fn with_underscores(&self, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/urls/with_underscores",
            None,
            None,
            options,
        ).await
    }

}

