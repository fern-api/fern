pub use crate::prelude::*;

/// An OAuth token response.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct AuthTokenResponse {
    #[serde(default)]
    pub access_token: String,
    #[serde(default)]
    pub expires_in: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
}

impl AuthTokenResponse {
    pub fn builder() -> AuthTokenResponseBuilder {
        <AuthTokenResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AuthTokenResponseBuilder {
    access_token: Option<String>,
    expires_in: Option<i64>,
    refresh_token: Option<String>,
}

impl AuthTokenResponseBuilder {
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

    /// Consumes the builder and constructs a [`AuthTokenResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`access_token`](AuthTokenResponseBuilder::access_token)
    /// - [`expires_in`](AuthTokenResponseBuilder::expires_in)
    pub fn build(self) -> Result<AuthTokenResponse, BuildError> {
        Ok(AuthTokenResponse {
            access_token: self
                .access_token
                .ok_or_else(|| BuildError::missing_field("access_token"))?,
            expires_in: self
                .expires_in
                .ok_or_else(|| BuildError::missing_field("expires_in"))?,
            refresh_token: self.refresh_token,
        })
    }
}
