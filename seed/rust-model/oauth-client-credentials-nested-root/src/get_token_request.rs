pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetTokenRequest {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
    pub audience: String,
    pub grant_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
}

impl GetTokenRequest {
    pub fn builder() -> GetTokenRequestBuilder {
        GetTokenRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetTokenRequestBuilder {
    client_id: Option<String>,
    client_secret: Option<String>,
    audience: Option<String>,
    grant_type: Option<String>,
    scope: Option<String>,
}

impl GetTokenRequestBuilder {
    pub fn client_id(mut self, value: impl Into<String>) -> Self {
        self.client_id = Some(value.into());
        self
    }

    pub fn client_secret(mut self, value: impl Into<String>) -> Self {
        self.client_secret = Some(value.into());
        self
    }

    pub fn audience(mut self, value: impl Into<String>) -> Self {
        self.audience = Some(value.into());
        self
    }

    pub fn grant_type(mut self, value: impl Into<String>) -> Self {
        self.grant_type = Some(value.into());
        self
    }

    pub fn scope(mut self, value: impl Into<String>) -> Self {
        self.scope = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetTokenRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`client_id`](GetTokenRequestBuilder::client_id)
    /// - [`client_secret`](GetTokenRequestBuilder::client_secret)
    /// - [`audience`](GetTokenRequestBuilder::audience)
    /// - [`grant_type`](GetTokenRequestBuilder::grant_type)
    pub fn build(self) -> Result<GetTokenRequest, BuildError> {
        Ok(GetTokenRequest {
            client_id: self.client_id.ok_or_else(|| BuildError::missing_field("client_id"))?,
            client_secret: self.client_secret.ok_or_else(|| BuildError::missing_field("client_secret"))?,
            audience: self.audience.ok_or_else(|| BuildError::missing_field("audience"))?,
            grant_type: self.grant_type.ok_or_else(|| BuildError::missing_field("grant_type"))?,
            scope: self.scope,
        })
    }
}

