pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompletionsStreamEventsContextProtocolRequest {
    #[serde(default)]
    pub query: String,
}

impl CompletionsStreamEventsContextProtocolRequest {
    pub fn builder() -> CompletionsStreamEventsContextProtocolRequestBuilder {
        <CompletionsStreamEventsContextProtocolRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CompletionsStreamEventsContextProtocolRequestBuilder {
    query: Option<String>,
}

impl CompletionsStreamEventsContextProtocolRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CompletionsStreamEventsContextProtocolRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](CompletionsStreamEventsContextProtocolRequestBuilder::query)
    pub fn build(self) -> Result<CompletionsStreamEventsContextProtocolRequest, BuildError> {
        Ok(CompletionsStreamEventsContextProtocolRequest {
            query: self.query.ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}

