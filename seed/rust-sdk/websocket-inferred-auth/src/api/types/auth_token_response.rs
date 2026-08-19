pub use crate::prelude::*;

/// An OAuth token response.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenResponse {
    #[serde(default)]
    pub access_token: String,
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
    refresh_token: Option<String>,
}

impl TokenResponseBuilder {
    pub fn access_token(mut self, value: impl Into<String>) -> Self {
        self.access_token = Some(value.into());
        self
    }

    pub fn refresh_token(mut self, value: impl Into<String>) -> Self {
        self.refresh_token = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TokenResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`access_token`](TokenResponseBuilder::access_token)
    pub fn build(self) -> Result<TokenResponse, BuildError> {
        Ok(TokenResponse {
            access_token: self
                .access_token
                .ok_or_else(|| BuildError::missing_field("access_token"))?,
            refresh_token: self.refresh_token,
        })
    }
}
