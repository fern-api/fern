pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DummyGenerateRequest {
    #[serde(default)]
    pub stream: bool,
    #[serde(default)]
    pub num_events: i64,
}

impl DummyGenerateRequest {
    pub fn builder() -> DummyGenerateRequestBuilder {
        <DummyGenerateRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DummyGenerateRequestBuilder {
    stream: Option<bool>,
    num_events: Option<i64>,
}

impl DummyGenerateRequestBuilder {
    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    pub fn num_events(mut self, value: i64) -> Self {
        self.num_events = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DummyGenerateRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`stream`](DummyGenerateRequestBuilder::stream)
    /// - [`num_events`](DummyGenerateRequestBuilder::num_events)
    pub fn build(self) -> Result<DummyGenerateRequest, BuildError> {
        Ok(DummyGenerateRequest {
            stream: self
                .stream
                .ok_or_else(|| BuildError::missing_field("stream"))?,
            num_events: self
                .num_events
                .ok_or_else(|| BuildError::missing_field("num_events"))?,
        })
    }
}
