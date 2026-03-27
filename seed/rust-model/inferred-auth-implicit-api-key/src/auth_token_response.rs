pub use crate::prelude::*;

/// An auth token response.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenResponse {
    #[serde(default)]
    pub access_token: String,
    #[serde(default)]
    pub token_type: String,
    #[serde(default)]
    pub expires_in: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
}

impl TokenResponse {
    pub fn builder() -> TokenResponseBuilder {
        <TokenResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TokenResponseBuilder {
    access_token: Option<String>,
    token_type: Option<String>,
    expires_in: Option<i64>,
    scope: Option<String>,
}

impl TokenResponseBuilder {
    pub fn access_token(mut self, value: impl Into<String>) -> Self {
        self.access_token = Some(value.into());
        self
    }

    pub fn token_type(mut self, value: impl Into<String>) -> Self {
        self.token_type = Some(value.into());
        self
    }

    pub fn expires_in(mut self, value: i64) -> Self {
        self.expires_in = Some(value);
        self
    }

    pub fn scope(mut self, value: impl Into<String>) -> Self {
        self.scope = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TokenResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`access_token`](TokenResponseBuilder::access_token)
    /// - [`token_type`](TokenResponseBuilder::token_type)
    /// - [`expires_in`](TokenResponseBuilder::expires_in)
    pub fn build(self) -> Result<TokenResponse, BuildError> {
        Ok(TokenResponse {
            access_token: self.access_token.ok_or_else(|| BuildError::missing_field("access_token"))?,
            token_type: self.token_type.ok_or_else(|| BuildError::missing_field("token_type"))?,
            expires_in: self.expires_in.ok_or_else(|| BuildError::missing_field("expires_in"))?,
            scope: self.scope,
        })
    }
}
