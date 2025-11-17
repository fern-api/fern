use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct MultipartFormClient {
    pub http_client: HttpClient,
}

impl MultipartFormClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn multipart_form(
        &self,
        request: &MultipartFormRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "multipart",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }
}
