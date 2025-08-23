use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PathParamClient {
    pub http_client: HttpClient,
}

impl PathParamClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send(&self, operand: &Operand, operand_or_color: &ColorOrOperand, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("path/{}{}", operand, operand_or_color),
            None,
            None,
            options,
        ).await
    }

}

