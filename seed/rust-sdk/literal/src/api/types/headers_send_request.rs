pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct HeadersSendRequest {
    #[serde(default)]
    pub query: String,
}

impl HeadersSendRequest {
    pub fn builder() -> HeadersSendRequestBuilder {
        <HeadersSendRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct HeadersSendRequestBuilder {
    query: Option<String>,
}

impl HeadersSendRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`HeadersSendRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](HeadersSendRequestBuilder::query)
    pub fn build(self) -> Result<HeadersSendRequest, BuildError> {
        Ok(HeadersSendRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
