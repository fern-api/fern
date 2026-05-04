pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<String>,
}

impl StreamRequest {
    pub fn builder() -> StreamRequestBuilder {
        <StreamRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamRequestBuilder {
    query: Option<String>,
}

impl StreamRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamRequest`].
    pub fn build(self) -> Result<StreamRequest, BuildError> {
        Ok(StreamRequest { query: self.query })
    }
}
