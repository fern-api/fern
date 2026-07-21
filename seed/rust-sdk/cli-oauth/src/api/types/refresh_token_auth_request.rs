pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RefreshTokenAuthRequest {
    #[serde(default)]
    pub refresh_token: String,
    pub grant_type: RefreshTokenAuthRequestGrantType,
}

impl RefreshTokenAuthRequest {
    pub fn builder() -> RefreshTokenAuthRequestBuilder {
        <RefreshTokenAuthRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RefreshTokenAuthRequestBuilder {
    refresh_token: Option<String>,
    grant_type: Option<RefreshTokenAuthRequestGrantType>,
}

impl RefreshTokenAuthRequestBuilder {
    pub fn refresh_token(mut self, value: impl Into<String>) -> Self {
        self.refresh_token = Some(value.into());
        self
    }

    pub fn grant_type(mut self, value: RefreshTokenAuthRequestGrantType) -> Self {
        self.grant_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RefreshTokenAuthRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`refresh_token`](RefreshTokenAuthRequestBuilder::refresh_token)
    /// - [`grant_type`](RefreshTokenAuthRequestBuilder::grant_type)
    pub fn build(self) -> Result<RefreshTokenAuthRequest, BuildError> {
        Ok(RefreshTokenAuthRequest {
            refresh_token: self
                .refresh_token
                .ok_or_else(|| BuildError::missing_field("refresh_token"))?,
            grant_type: self
                .grant_type
                .ok_or_else(|| BuildError::missing_field("grant_type"))?,
        })
    }
}
