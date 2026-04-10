pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompletionsStreamEventsRequest {
    #[serde(default)]
    pub query: String,
}

impl CompletionsStreamEventsRequest {
    pub fn builder() -> CompletionsStreamEventsRequestBuilder {
        <CompletionsStreamEventsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CompletionsStreamEventsRequestBuilder {
    query: Option<String>,
}

impl CompletionsStreamEventsRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CompletionsStreamEventsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](CompletionsStreamEventsRequestBuilder::query)
    pub fn build(self) -> Result<CompletionsStreamEventsRequest, BuildError> {
        Ok(CompletionsStreamEventsRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
        })
    }
}
