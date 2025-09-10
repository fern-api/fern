use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct QueryParamClient {
    pub http_client: HttpClient,
}

impl QueryParamClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send(&self, operand: Option<Operand>, maybe_operand: Option<Operand>, operand_or_color: Option<ColorOrOperand>, maybe_operand_or_color: Option<ColorOrOperand>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "query",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = operand {
                query_params.push(("operand".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = maybe_operand {
                query_params.push(("maybeOperand".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = operand_or_color {
                query_params.push(("operandOrColor".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = maybe_operand_or_color {
                query_params.push(("maybeOperandOrColor".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn send_list(&self, operand: Option<Operand>, maybe_operand: Option<Operand>, operand_or_color: Option<ColorOrOperand>, maybe_operand_or_color: Option<ColorOrOperand>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "query-list",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = operand {
                query_params.push(("operand".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = maybe_operand {
                query_params.push(("maybeOperand".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = operand_or_color {
                query_params.push(("operandOrColor".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = maybe_operand_or_color {
                query_params.push(("maybeOperandOrColor".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

