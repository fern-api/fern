use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct InlinedRequestClient {
    pub http_client: HttpClient,
}

impl InlinedRequestClient {
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
    ///         .inlined_request
    ///         .send(
    ///             &SendEnumInlinedRequest {
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
        request: &SendEnumInlinedRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "inlined",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
