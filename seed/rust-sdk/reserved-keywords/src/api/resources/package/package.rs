use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, QueryBuilder};
use reqwest::{Method};
use crate::api::{*};

pub struct PackageClient {
    pub http_client: HttpClient,
}

impl PackageClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn test(&self, request: &TestQueryRequest, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            None,
            QueryBuilder::new().string("for", request.r#for.clone())
            .build(),
            options,
        ).await
    }

}

