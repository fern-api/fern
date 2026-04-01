use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct QueryParamClient {
    pub http_client: HttpClient,
}

impl QueryParamClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn send(
        &self,
        request: &SendQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "query",
                None,
                QueryBuilder::new()
                    .serialize("operand", Some(request.operand.clone()))
                    .serialize("maybeOperand", request.maybe_operand.clone())
                    .serialize("operandOrColor", Some(request.operand_or_color.clone()))
                    .serialize(
                        "maybeOperandOrColor",
                        request.maybe_operand_or_color.clone(),
                    )
                    .build(),
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn send_with_raw_response(
        &self,
        request: &SendQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "query",
                None,
                QueryBuilder::new()
                    .serialize("operand", Some(request.operand.clone()))
                    .serialize("maybeOperand", request.maybe_operand.clone())
                    .serialize("operandOrColor", Some(request.operand_or_color.clone()))
                    .serialize(
                        "maybeOperandOrColor",
                        request.maybe_operand_or_color.clone(),
                    )
                    .build(),
                options,
            )
            .await
    }

    pub async fn send_list(
        &self,
        request: &SendListQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "query-list",
                None,
                QueryBuilder::new()
                    .serialize_array("operand", request.operand.clone())
                    .serialize_array("maybeOperand", request.maybe_operand.clone())
                    .serialize_array("operandOrColor", request.operand_or_color.clone())
                    .serialize_array(
                        "maybeOperandOrColor",
                        request.maybe_operand_or_color.clone(),
                    )
                    .build(),
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn send_list_with_raw_response(
        &self,
        request: &SendListQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "query-list",
                None,
                QueryBuilder::new()
                    .serialize_array("operand", request.operand.clone())
                    .serialize_array("maybeOperand", request.maybe_operand.clone())
                    .serialize_array("operandOrColor", request.operand_or_color.clone())
                    .serialize_array(
                        "maybeOperandOrColor",
                        request.maybe_operand_or_color.clone(),
                    )
                    .build(),
                options,
            )
            .await
    }
}
