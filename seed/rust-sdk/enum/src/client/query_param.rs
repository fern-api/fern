use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct QueryParamClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl QueryParamClient {
    pub fn new(config: ClientConfig, api_key: Option<String>, bearer_token: Option<String>, username: Option<String>, password: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { 
            http_client, 
            api_key, 
            bearer_token, 
            username, 
            password 
        })
    }

    pub async fn send(&self, operand: Option<&Operand>, maybe_operand: Option<&Option<Operand>>, operand_or_color: Option<&ColorOrOperand>, maybe_operand_or_color: Option<&Option<ColorOrOperand>>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "query",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = operand {
                query_params.push(("operand".to_string(), value.to_string()));
            }
            if let Some(value) = maybe_operand {
                query_params.push(("maybeOperand".to_string(), value.to_string()));
            }
            if let Some(value) = operand_or_color {
                query_params.push(("operandOrColor".to_string(), value.to_string()));
            }
            if let Some(value) = maybe_operand_or_color {
                query_params.push(("maybeOperandOrColor".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn send_list(&self, operand: Option<&Operand>, maybe_operand: Option<&Option<Operand>>, operand_or_color: Option<&ColorOrOperand>, maybe_operand_or_color: Option<&Option<ColorOrOperand>>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "query-list",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = operand {
                query_params.push(("operand".to_string(), value.to_string()));
            }
            if let Some(value) = maybe_operand {
                query_params.push(("maybeOperand".to_string(), value.to_string()));
            }
            if let Some(value) = operand_or_color {
                query_params.push(("operandOrColor".to_string(), value.to_string()));
            }
            if let Some(value) = maybe_operand_or_color {
                query_params.push(("maybeOperandOrColor".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

