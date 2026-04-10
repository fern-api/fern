pub use crate::prelude::*;

/// The request body for getting an OAuth token.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetTokenRequest {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
}

impl GetTokenRequest {
    pub fn builder() -> GetTokenRequestBuilder {
        <GetTokenRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetTokenRequestBuilder {
    client_id: Option<String>,
    client_secret: Option<String>,
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

    /// Consumes the builder and constructs a [`GetTokenRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`client_id`](GetTokenRequestBuilder::client_id)
    /// - [`client_secret`](GetTokenRequestBuilder::client_secret)
    pub fn build(self) -> Result<GetTokenRequest, BuildError> {
        Ok(GetTokenRequest {
            client_id: self.client_id.ok_or_else(|| BuildError::missing_field("client_id"))?,
            client_secret: self.client_secret.ok_or_else(|| BuildError::missing_field("client_secret"))?,
        })
    }
}
