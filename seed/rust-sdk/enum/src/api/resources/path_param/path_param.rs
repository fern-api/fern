use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct PathParamClient {
    pub http_client: HttpClient,
}

impl PathParamClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn send(
        &self,
        operand: &Operand,
        operand_or_color: &ColorOrOperand,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("path/{}/{}", operand, operand_or_color),
                None,
                None,
                options,
            )
            .await
    }
}
