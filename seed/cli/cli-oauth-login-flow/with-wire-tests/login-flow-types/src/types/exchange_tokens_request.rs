pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ExchangeTokensRequest {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
}

impl ExchangeTokensRequest {
    pub fn builder() -> ExchangeTokensRequestBuilder {
        <ExchangeTokensRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExchangeTokensRequestBuilder {
    client_id: Option<String>,
    client_secret: Option<String>,
}

impl ExchangeTokensRequestBuilder {
    pub fn client_id(mut self, value: impl Into<String>) -> Self {
        self.client_id = Some(value.into());
        self
    }

    pub fn client_secret(mut self, value: impl Into<String>) -> Self {
        self.client_secret = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ExchangeTokensRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`client_id`](ExchangeTokensRequestBuilder::client_id)
    /// - [`client_secret`](ExchangeTokensRequestBuilder::client_secret)
    pub fn build(self) -> Result<ExchangeTokensRequest, BuildError> {
        Ok(ExchangeTokensRequest {
            client_id: self.client_id.ok_or_else(|| BuildError::missing_field("client_id"))?,
            client_secret: self.client_secret.ok_or_else(|| BuildError::missing_field("client_secret"))?,
        })
    }
}

