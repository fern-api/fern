pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct AuthGetTokenWithClientCredentialsRequest {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
    pub audience: AuthGetTokenWithClientCredentialsRequestAudience,
    pub grant_type: AuthGetTokenWithClientCredentialsRequestGrantType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
}

impl AuthGetTokenWithClientCredentialsRequest {
    pub fn builder() -> AuthGetTokenWithClientCredentialsRequestBuilder {
        <AuthGetTokenWithClientCredentialsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AuthGetTokenWithClientCredentialsRequestBuilder {
    client_id: Option<String>,
    client_secret: Option<String>,
    audience: Option<AuthGetTokenWithClientCredentialsRequestAudience>,
    grant_type: Option<AuthGetTokenWithClientCredentialsRequestGrantType>,
    scope: Option<String>,
}

impl AuthGetTokenWithClientCredentialsRequestBuilder {
    pub fn client_id(mut self, value: impl Into<String>) -> Self {
        self.client_id = Some(value.into());
        self
    }

    pub fn client_secret(mut self, value: impl Into<String>) -> Self {
        self.client_secret = Some(value.into());
        self
    }

    pub fn audience(mut self, value: AuthGetTokenWithClientCredentialsRequestAudience) -> Self {
        self.audience = Some(value);
        self
    }

    pub fn grant_type(mut self, value: AuthGetTokenWithClientCredentialsRequestGrantType) -> Self {
        self.grant_type = Some(value);
        self
    }

    pub fn scope(mut self, value: impl Into<String>) -> Self {
        self.scope = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AuthGetTokenWithClientCredentialsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`client_id`](AuthGetTokenWithClientCredentialsRequestBuilder::client_id)
    /// - [`client_secret`](AuthGetTokenWithClientCredentialsRequestBuilder::client_secret)
    /// - [`audience`](AuthGetTokenWithClientCredentialsRequestBuilder::audience)
    /// - [`grant_type`](AuthGetTokenWithClientCredentialsRequestBuilder::grant_type)
    pub fn build(self) -> Result<AuthGetTokenWithClientCredentialsRequest, BuildError> {
        Ok(AuthGetTokenWithClientCredentialsRequest {
            client_id: self
                .client_id
                .ok_or_else(|| BuildError::missing_field("client_id"))?,
            client_secret: self
                .client_secret
                .ok_or_else(|| BuildError::missing_field("client_secret"))?,
            audience: self
                .audience
                .ok_or_else(|| BuildError::missing_field("audience"))?,
            grant_type: self
                .grant_type
                .ok_or_else(|| BuildError::missing_field("grant_type"))?,
            scope: self.scope,
        })
    }
}
