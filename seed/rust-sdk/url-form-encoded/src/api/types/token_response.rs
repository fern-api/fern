pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub access_token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_in: Option<i64>,
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
    pub fn build(self) -> Result<TokenResponse, BuildError> {
        Ok(TokenResponse {
            access_token: self.access_token,
            expires_in: self.expires_in,
        })
    }
}
