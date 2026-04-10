pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamEventContextProtocolTwo {
    pub event: StreamEventContextProtocolTwoEvent,
    #[serde(default)]
    pub name: String,
}

impl StreamEventContextProtocolTwo {
    pub fn builder() -> StreamEventContextProtocolTwoBuilder {
        <StreamEventContextProtocolTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamEventContextProtocolTwoBuilder {
    event: Option<StreamEventContextProtocolTwoEvent>,
    name: Option<String>,
}

impl StreamEventContextProtocolTwoBuilder {
    pub fn event(mut self, value: StreamEventContextProtocolTwoEvent) -> Self {
        self.event = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamEventContextProtocolTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`event`](StreamEventContextProtocolTwoBuilder::event)
    /// - [`name`](StreamEventContextProtocolTwoBuilder::name)
    pub fn build(self) -> Result<StreamEventContextProtocolTwo, BuildError> {
        Ok(StreamEventContextProtocolTwo {
            event: self.event.ok_or_else(|| BuildError::missing_field("event"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
