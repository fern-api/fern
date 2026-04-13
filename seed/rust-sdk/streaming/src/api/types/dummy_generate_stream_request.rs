pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DummyGenerateStreamRequest {
    #[serde(default)]
    pub stream: bool,
    #[serde(default)]
    pub num_events: i64,
}

impl DummyGenerateStreamRequest {
    pub fn builder() -> DummyGenerateStreamRequestBuilder {
        <DummyGenerateStreamRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DummyGenerateStreamRequestBuilder {
    stream: Option<bool>,
    num_events: Option<i64>,
}

impl DummyGenerateStreamRequestBuilder {
    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    pub fn num_events(mut self, value: i64) -> Self {
        self.num_events = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DummyGenerateStreamRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`stream`](DummyGenerateStreamRequestBuilder::stream)
    /// - [`num_events`](DummyGenerateStreamRequestBuilder::num_events)
    pub fn build(self) -> Result<DummyGenerateStreamRequest, BuildError> {
        Ok(DummyGenerateStreamRequest {
            stream: self
                .stream
                .ok_or_else(|| BuildError::missing_field("stream"))?,
            num_events: self
                .num_events
                .ok_or_else(|| BuildError::missing_field("num_events"))?,
        })
    }
}
