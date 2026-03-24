pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Generateequest {
    pub stream: bool,
    #[serde(default)]
    pub num_events: i64,
}

impl Generateequest {
    pub fn builder() -> GenerateequestBuilder {
        GenerateequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GenerateequestBuilder {
    stream: Option<bool>,
    num_events: Option<i64>,
}

impl GenerateequestBuilder {
    pub fn stream(mut self, value: bool) -> Self {
        self.stream = Some(value);
        self
    }

    pub fn num_events(mut self, value: i64) -> Self {
        self.num_events = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Generateequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`stream`](GenerateequestBuilder::stream)
    /// - [`num_events`](GenerateequestBuilder::num_events)
    pub fn build(self) -> Result<Generateequest, BuildError> {
        Ok(Generateequest {
            stream: self
                .stream
                .ok_or_else(|| BuildError::missing_field("stream"))?,
            num_events: self
                .num_events
                .ok_or_else(|| BuildError::missing_field("num_events"))?,
        })
    }
}
