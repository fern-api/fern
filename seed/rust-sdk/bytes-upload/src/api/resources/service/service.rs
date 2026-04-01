use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn upload(
        &self,
        request: &Vec<u8>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_bytes_request(
                Method::POST,
                "upload-content",
                Some(request.to_vec()),
                None,
                options,
            )
            .await
    }

    pub async fn upload_with_query_params(
        &self,
        request: &UploadWithQueryParamsRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_bytes_request(
                Method::POST,
                "upload-content-with-query-params",
                Some(request.body.to_vec()),
                QueryBuilder::new()
                    .string("model", request.model.clone())
                    .string("language", request.language.clone())
                    .build(),
                options,
            )
            .await
    }
}
