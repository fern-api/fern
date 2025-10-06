use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct EndpointsEnumClient {
    pub http_client: HttpClient,
}

impl EndpointsEnumClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_and_return_enum(
        &self,
        request: &TypesEnumWeatherReport,
        options: Option<RequestOptions>,
    ) -> Result<TypesEnumWeatherReport, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/enum",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
