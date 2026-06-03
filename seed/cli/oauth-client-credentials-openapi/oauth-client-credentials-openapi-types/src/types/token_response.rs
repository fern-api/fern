pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenResponse {
    #[serde(default)]
    pub access_token: String,
    #[serde(default)]
    pub expires_in: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
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
    expires_in: Option<i64>,
    refresh_token: Option<String>,
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

    pub fn refresh_token(mut self, value: impl Into<String>) -> Self {
        self.refresh_token = Some(value.into());
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
            refresh_token: self.refresh_token,
        })
    }
}
