use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct QueryParamClient {
    pub http_client: HttpClient,
}

impl QueryParamClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send(&self, operand: Option<&Operand>, maybe_operand: Option<&Option<Operand>>, operand_or_color: Option<&ColorOrOperand>, maybe_operand_or_color: Option<&Option<ColorOrOperand>>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "query",
            None,
            options,
        ).await
    }

    pub async fn send_list(&self, operand: Option<&Operand>, maybe_operand: Option<&Option<Operand>>, operand_or_color: Option<&ColorOrOperand>, maybe_operand_or_color: Option<&Option<ColorOrOperand>>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "query-list",
            None,
            options,
        ).await
    }

}

