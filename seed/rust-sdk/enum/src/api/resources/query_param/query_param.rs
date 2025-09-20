use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::api::types::{*};

pub struct QueryParamClient {
    pub http_client: HttpClient,
}

impl QueryParamClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config)?
})
    }

    pub async fn send(&self, operand: Option<Operand>, maybe_operand: Option<Operand>, operand_or_color: Option<ColorOrOperand>, maybe_operand_or_color: Option<ColorOrOperand>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "query",
            None,
            QueryBuilder::new().serialize("operand", operand).serialize("maybeOperand", maybe_operand).serialize("operandOrColor", operand_or_color).serialize("maybeOperandOrColor", maybe_operand_or_color)
            .build(),
            options,
        ).await
    }

    pub async fn send_list(&self, operand: Option<Operand>, maybe_operand: Option<Operand>, operand_or_color: Option<ColorOrOperand>, maybe_operand_or_color: Option<ColorOrOperand>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "query-list",
            None,
            QueryBuilder::new().serialize("operand", operand).serialize("maybeOperand", maybe_operand).serialize("operandOrColor", operand_or_color).serialize("maybeOperandOrColor", maybe_operand_or_color)
            .build(),
            options,
        ).await
    }

}

