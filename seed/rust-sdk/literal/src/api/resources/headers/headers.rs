use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct HeadersClient {
    pub http_client: HttpClient,
}

impl HeadersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn send(
        &self,
        request: &SendLiteralsInHeadersRequest,
        options: Option<RequestOptions>,
    ) -> Result<SendResponse, ApiError> {
        let options = {
            let mut o = options.unwrap_or_default();
            o.additional_headers
                .entry("X-API-Version".to_string())
                .or_insert_with(|| "02-02-2024".to_string());
            o.additional_headers
                .entry("X-API-Enable-Audit-Logging".to_string())
                .or_insert_with(|| "true".to_string());
            o.additional_headers
                .entry("X-Endpoint-Version".to_string())
                .or_insert_with(|| "02-12-2024".to_string());
            o.additional_headers
                .entry("X-Async".to_string())
                .or_insert_with(|| "true".to_string());
            Some(o)
        };
        self.http_client
            .execute_request(
                Method::POST,
                "headers",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn send_literals_only(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<SendResponse, ApiError> {
        let options = {
            let mut o = options.unwrap_or_default();
            o.additional_headers
                .entry("X-API-Version".to_string())
                .or_insert_with(|| "02-02-2024".to_string());
            o.additional_headers
                .entry("X-API-Enable-Audit-Logging".to_string())
                .or_insert_with(|| "true".to_string());
            o.additional_headers
                .entry("X-Endpoint-Version".to_string())
                .or_insert_with(|| "02-12-2024".to_string());
            o.additional_headers
                .entry("X-Async".to_string())
                .or_insert_with(|| "true".to_string());
            Some(o)
        };
        self.http_client
            .execute_request(Method::POST, "headers/literals-only", None, None, options)
            .await
    }
}
