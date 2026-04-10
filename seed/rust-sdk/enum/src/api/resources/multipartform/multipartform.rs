use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct MultipartformClient {
    pub http_client: HttpClient,
}

impl MultipartformClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn multipartform(&self, request: &MultipartformRequest, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_multipart_request(
            Method::POST,
            "multipart",
            request.clone().to_multipart(),
            None,
            options,
        ).await
    }

}

