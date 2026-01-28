use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, QueryBuilder};
use reqwest::{Method};
use crate::api::{*};

pub struct FooClient {
    pub http_client: HttpClient,
}

impl FooClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn find(&self, request: &FindRequest, options: Option<RequestOptions>) -> Result<ImportingType, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            Some(serde_json::to_value(request).unwrap_or_default()),
            QueryBuilder::new().serialize("optionalString", Some(request.optional_string.clone()))
            .build(),
            options,
        ).await
    }

}

