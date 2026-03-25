pub use crate::prelude::*;

/// An OAuth token response.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenResponse {
    #[serde(default)]
    pub access_token: String,
    #[serde(default)]
    pub expires_in: i64,
}

impl TokenResponse {
    pub fn builder() -> TokenResponseBuilder {
        TokenResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TokenResponseBuilder {
    access_token: Option<String>,
    expires_in: Option<i64>,
}

impl TokenResponseBuilder {
    pub fn access_token(mut self, value: impl Into<String>) -> Self {
        self.access_token = Some(value.into());
        self
    }

    pub fn expires_in(mut self, value: i64) -> Self {
        self.expires_in = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TokenResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`access_token`](TokenResponseBuilder::access_token)
    /// - [`expires_in`](TokenResponseBuilder::expires_in)
    pub fn build(self) -> Result<TokenResponse, BuildError> {
        Ok(TokenResponse {
            access_token: self.access_token.ok_or_else(|| BuildError::missing_field("access_token"))?,
            expires_in: self.expires_in.ok_or_else(|| BuildError::missing_field("expires_in"))?,
        })
    }
}
