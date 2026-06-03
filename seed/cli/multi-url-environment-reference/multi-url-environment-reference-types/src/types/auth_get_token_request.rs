pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct AuthGetTokenRequest {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
}

impl AuthGetTokenRequest {
    pub fn builder() -> AuthGetTokenRequestBuilder {
        <AuthGetTokenRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AuthGetTokenRequestBuilder {
    client_id: Option<String>,
    client_secret: Option<String>,
}

impl AuthGetTokenRequestBuilder {
    pub fn client_id(mut self, value: impl Into<String>) -> Self {
        self.client_id = Some(value.into());
        self
    }

    pub fn client_secret(mut self, value: impl Into<String>) -> Self {
        self.client_secret = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AuthGetTokenRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`client_id`](AuthGetTokenRequestBuilder::client_id)
    /// - [`client_secret`](AuthGetTokenRequestBuilder::client_secret)
    pub fn build(self) -> Result<AuthGetTokenRequest, BuildError> {
        Ok(AuthGetTokenRequest {
            client_id: self.client_id.ok_or_else(|| BuildError::missing_field("client_id"))?,
            client_secret: self.client_secret.ok_or_else(|| BuildError::missing_field("client_secret"))?,
        })
    }
}

