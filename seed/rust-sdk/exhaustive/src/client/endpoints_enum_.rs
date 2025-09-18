use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct EndpointsEnumClient {
    pub http_client: HttpClient,
}

impl EndpointsEnumClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_and_return_enum(&self, request: &WeatherReport, options: Option<RequestOptions>) -> Result<WeatherReport, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/enum",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

