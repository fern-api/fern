use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, QueryBuilder};
use reqwest::{Method};
use crate::api::{*};

pub struct QueryParamClient {
    pub http_client: HttpClient,
}

impl QueryParamClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn send(&self, request: &SendQueryRequest, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "query",
            None,
            QueryBuilder::new().serialize("operand", request.operand.clone()).serialize("maybeOperand", request.maybe_operand.clone()).serialize("operandOrColor", request.operand_or_color.clone()).serialize("maybeOperandOrColor", request.maybe_operand_or_color.clone())
            .build(),
            options,
        ).await
    }

    pub async fn send_list(&self, request: &SendListQueryRequest, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "query-list",
            None,
            QueryBuilder::new().serialize("operand", request.operand.clone()).serialize("maybeOperand", request.maybe_operand.clone()).serialize("operandOrColor", request.operand_or_color.clone()).serialize("maybeOperandOrColor", request.maybe_operand_or_color.clone())
            .build(),
            options,
        ).await
    }

}

