pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct IdentityGetTokenRequest {
    #[serde(default)]
    pub username: String,
    #[serde(default)]
    pub password: String,
}

impl IdentityGetTokenRequest {
    pub fn builder() -> IdentityGetTokenRequestBuilder {
        <IdentityGetTokenRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct IdentityGetTokenRequestBuilder {
    username: Option<String>,
    password: Option<String>,
}

impl IdentityGetTokenRequestBuilder {
    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    pub fn password(mut self, value: impl Into<String>) -> Self {
        self.password = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`IdentityGetTokenRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`username`](IdentityGetTokenRequestBuilder::username)
    /// - [`password`](IdentityGetTokenRequestBuilder::password)
    pub fn build(self) -> Result<IdentityGetTokenRequest, BuildError> {
        Ok(IdentityGetTokenRequest {
            username: self
                .username
                .ok_or_else(|| BuildError::missing_field("username"))?,
            password: self
                .password
                .ok_or_else(|| BuildError::missing_field("password"))?,
        })
    }
}
