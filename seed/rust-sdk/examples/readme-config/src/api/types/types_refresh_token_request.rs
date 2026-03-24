pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RefreshTokenRequest {
    #[serde(default)]
    pub ttl: i64,
}

impl RefreshTokenRequest {
    pub fn builder() -> RefreshTokenRequestBuilder {
        RefreshTokenRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RefreshTokenRequestBuilder {
    ttl: Option<i64>,
}

impl RefreshTokenRequestBuilder {
    pub fn ttl(mut self, value: i64) -> Self {
        self.ttl = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RefreshTokenRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`ttl`](RefreshTokenRequestBuilder::ttl)
    pub fn build(self) -> Result<RefreshTokenRequest, BuildError> {
        Ok(RefreshTokenRequest {
            ttl: self.ttl.ok_or_else(|| BuildError::missing_field("ttl"))?,
        })
    }
}
