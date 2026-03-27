pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetTokenIdentityRequest {
    #[serde(default)]
    pub username: String,
    #[serde(default)]
    pub password: String,
}

impl GetTokenIdentityRequest {
    pub fn builder() -> GetTokenIdentityRequestBuilder {
        GetTokenIdentityRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetTokenIdentityRequestBuilder {
    username: Option<String>,
    password: Option<String>,
}

impl GetTokenIdentityRequestBuilder {
    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    pub fn password(mut self, value: impl Into<String>) -> Self {
        self.password = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetTokenIdentityRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`username`](GetTokenIdentityRequestBuilder::username)
    /// - [`password`](GetTokenIdentityRequestBuilder::password)
    pub fn build(self) -> Result<GetTokenIdentityRequest, BuildError> {
        Ok(GetTokenIdentityRequest {
            username: self.username.ok_or_else(|| BuildError::missing_field("username"))?,
            password: self.password.ok_or_else(|| BuildError::missing_field("password"))?,
        })
    }
}

