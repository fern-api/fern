pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendLiteralsInHeadersRequest {
    #[serde(default)]
    pub query: String,
}

impl SendLiteralsInHeadersRequest {
    pub fn builder() -> SendLiteralsInHeadersRequestBuilder {
        <SendLiteralsInHeadersRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendLiteralsInHeadersRequestBuilder {
    query: Option<String>,
}

impl SendLiteralsInHeadersRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SendLiteralsInHeadersRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](SendLiteralsInHeadersRequestBuilder::query)
    pub fn build(self) -> Result<SendLiteralsInHeadersRequest, BuildError> {
        Ok(SendLiteralsInHeadersRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
