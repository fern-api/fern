pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenRequest {
    /// Client identifier
    #[serde(default)]
    pub client_id: String,
    /// Client secret
    #[serde(default)]
    pub client_secret: String,
}

impl TokenRequest {
    pub fn builder() -> TokenRequestBuilder {
        <TokenRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TokenRequestBuilder {
    client_id: Option<String>,
    client_secret: Option<String>,
}

impl TokenRequestBuilder {
    pub fn client_id(mut self, value: impl Into<String>) -> Self {
        self.client_id = Some(value.into());
        self
    }

    pub fn client_secret(mut self, value: impl Into<String>) -> Self {
        self.client_secret = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TokenRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`client_id`](TokenRequestBuilder::client_id)
    /// - [`client_secret`](TokenRequestBuilder::client_secret)
    pub fn build(self) -> Result<TokenRequest, BuildError> {
        Ok(TokenRequest {
            client_id: self
                .client_id
                .ok_or_else(|| BuildError::missing_field("client_id"))?,
            client_secret: self
                .client_secret
                .ok_or_else(|| BuildError::missing_field("client_secret"))?,
        })
    }
}
