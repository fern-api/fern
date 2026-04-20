pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct AuthGetTokenResponse {
    #[serde(default)]
    pub access_token: String,
}

impl AuthGetTokenResponse {
    pub fn builder() -> AuthGetTokenResponseBuilder {
        <AuthGetTokenResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AuthGetTokenResponseBuilder {
    access_token: Option<String>,
}

impl AuthGetTokenResponseBuilder {
    pub fn access_token(mut self, value: impl Into<String>) -> Self {
        self.access_token = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AuthGetTokenResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`access_token`](AuthGetTokenResponseBuilder::access_token)
    pub fn build(self) -> Result<AuthGetTokenResponse, BuildError> {
        Ok(AuthGetTokenResponse {
            access_token: self
                .access_token
                .ok_or_else(|| BuildError::missing_field("access_token"))?,
        })
    }
}
