pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct AuthRefreshTokenRequest {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
    #[serde(default)]
    pub refresh_token: String,
    pub audience: AuthRefreshTokenRequestAudience,
    pub grant_type: AuthRefreshTokenRequestGrantType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
}

impl AuthRefreshTokenRequest {
    pub fn builder() -> AuthRefreshTokenRequestBuilder {
        <AuthRefreshTokenRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AuthRefreshTokenRequestBuilder {
    client_id: Option<String>,
    client_secret: Option<String>,
    refresh_token: Option<String>,
    audience: Option<AuthRefreshTokenRequestAudience>,
    grant_type: Option<AuthRefreshTokenRequestGrantType>,
    scope: Option<String>,
}

impl AuthRefreshTokenRequestBuilder {
    pub fn client_id(mut self, value: impl Into<String>) -> Self {
        self.client_id = Some(value.into());
        self
    }

    pub fn client_secret(mut self, value: impl Into<String>) -> Self {
        self.client_secret = Some(value.into());
        self
    }

    pub fn refresh_token(mut self, value: impl Into<String>) -> Self {
        self.refresh_token = Some(value.into());
        self
    }

    pub fn audience(mut self, value: AuthRefreshTokenRequestAudience) -> Self {
        self.audience = Some(value);
        self
    }

    pub fn grant_type(mut self, value: AuthRefreshTokenRequestGrantType) -> Self {
        self.grant_type = Some(value);
        self
    }

    pub fn scope(mut self, value: impl Into<String>) -> Self {
        self.scope = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AuthRefreshTokenRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`client_id`](AuthRefreshTokenRequestBuilder::client_id)
    /// - [`client_secret`](AuthRefreshTokenRequestBuilder::client_secret)
    /// - [`refresh_token`](AuthRefreshTokenRequestBuilder::refresh_token)
    /// - [`audience`](AuthRefreshTokenRequestBuilder::audience)
    /// - [`grant_type`](AuthRefreshTokenRequestBuilder::grant_type)
    pub fn build(self) -> Result<AuthRefreshTokenRequest, BuildError> {
        Ok(AuthRefreshTokenRequest {
            client_id: self.client_id.ok_or_else(|| BuildError::missing_field("client_id"))?,
            client_secret: self.client_secret.ok_or_else(|| BuildError::missing_field("client_secret"))?,
            refresh_token: self.refresh_token.ok_or_else(|| BuildError::missing_field("refresh_token"))?,
            audience: self.audience.ok_or_else(|| BuildError::missing_field("audience"))?,
            grant_type: self.grant_type.ok_or_else(|| BuildError::missing_field("grant_type"))?,
            scope: self.scope,
        })
    }
}

