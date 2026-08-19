use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_enum::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = EnumClient::new(config).expect("Failed to build client");
    ///     client
    ///         .query_param
    ///         .send(
    ///             &SendQueryRequest {
    ///                 operand: Operand::GreaterThan,
    ///                 operand_or_color: ColorOrOperand::Color(Color::Red),
    ///                 maybe_operand: None,
    ///                 maybe_operand_or_color: None,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_enum::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = EnumClient::new(config).expect("Failed to build client");
    ///     client
    ///         .query_param
    ///         .send_list(
    ///             &SendListQueryRequest {
    ///                 operand: vec![Operand::GreaterThan],
    ///                 maybe_operand: vec![Some(Operand::GreaterThan)],
    ///                 operand_or_color: vec![ColorOrOperand::Color(Color::Red)],
    ///                 maybe_operand_or_color: vec![Some(ColorOrOperand::Color(Color::Red))],
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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
}
