use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct EnumClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl EnumClient {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn get_and_return_enum(&self, request: &WeatherReport, options: Option<RequestOptions>) -> Result<WeatherReport, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/enum",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

