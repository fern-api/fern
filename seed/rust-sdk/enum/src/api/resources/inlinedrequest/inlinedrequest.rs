use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct InlinedrequestClient {
    pub http_client: HttpClient,
}

impl InlinedrequestClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn send(&self, request: &InlinedRequestSendRequest, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "inlined",
            Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
            None,
            options,
        ).await
    }

}

