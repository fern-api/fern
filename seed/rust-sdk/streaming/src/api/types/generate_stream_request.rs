pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GenerateStreamRequest {
    pub stream: bool,
    #[serde(default)]
    pub num_events: i64,
}

impl GenerateStreamRequest {
    pub fn builder() -> GenerateStreamRequestBuilder {
        <GenerateStreamRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GenerateStreamRequestBuilder {
    stream: Option<bool>,
    num_events: Option<i64>,
}

impl GenerateStreamRequestBuilder {
    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    pub fn num_events(mut self, value: i64) -> Self {
        self.num_events = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GenerateStreamRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`stream`](GenerateStreamRequestBuilder::stream)
    /// - [`num_events`](GenerateStreamRequestBuilder::num_events)
    pub fn build(self) -> Result<GenerateStreamRequest, BuildError> {
        Ok(GenerateStreamRequest {
            stream: self
                .stream
                .ok_or_else(|| BuildError::missing_field("stream"))?,
            num_events: self
                .num_events
                .ok_or_else(|| BuildError::missing_field("num_events"))?,
        })
    }
}
