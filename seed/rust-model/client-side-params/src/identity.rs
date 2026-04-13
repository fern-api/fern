pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Identity {
    #[serde(default)]
    pub connection: String,
    #[serde(default)]
    pub user_id: String,
    #[serde(default)]
    pub provider: String,
    #[serde(default)]
    pub is_social: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub access_token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_in: Option<i64>,
}

impl Identity {
    pub fn builder() -> IdentityBuilder {
        <IdentityBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct IdentityBuilder {
    connection: Option<String>,
    user_id: Option<String>,
    provider: Option<String>,
    is_social: Option<bool>,
    access_token: Option<String>,
    expires_in: Option<i64>,
}

impl IdentityBuilder {
    pub fn connection(mut self, value: impl Into<String>) -> Self {
        self.connection = Some(value.into());
        self
    }

    pub fn user_id(mut self, value: impl Into<String>) -> Self {
        self.user_id = Some(value.into());
        self
    }

    pub fn provider(mut self, value: impl Into<String>) -> Self {
        self.provider = Some(value.into());
        self
    }

    pub fn is_social(mut self, value: bool) -> Self {
        self.is_social = Some(value);
        self
    }

    pub fn access_token(mut self, value: impl Into<String>) -> Self {
        self.access_token = Some(value.into());
        self
    }

    pub fn expires_in(mut self, value: i64) -> Self {
        self.expires_in = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Identity`].
    /// This method will fail if any of the following fields are not set:
    /// - [`connection`](IdentityBuilder::connection)
    /// - [`user_id`](IdentityBuilder::user_id)
    /// - [`provider`](IdentityBuilder::provider)
    /// - [`is_social`](IdentityBuilder::is_social)
    pub fn build(self) -> Result<Identity, BuildError> {
        Ok(Identity {
            connection: self.connection.ok_or_else(|| BuildError::missing_field("connection"))?,
            user_id: self.user_id.ok_or_else(|| BuildError::missing_field("user_id"))?,
            provider: self.provider.ok_or_else(|| BuildError::missing_field("provider"))?,
            is_social: self.is_social.ok_or_else(|| BuildError::missing_field("is_social"))?,
            access_token: self.access_token,
            expires_in: self.expires_in,
        })
    }
}
