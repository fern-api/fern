pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamEventContextProtocolOne {
    #[serde(flatten)]
    pub error_event_fields: ErrorEvent,
    pub event: StreamEventContextProtocolOneEvent,
}

impl StreamEventContextProtocolOne {
    pub fn builder() -> StreamEventContextProtocolOneBuilder {
        <StreamEventContextProtocolOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamEventContextProtocolOneBuilder {
    error_event_fields: Option<ErrorEvent>,
    event: Option<StreamEventContextProtocolOneEvent>,
}

impl StreamEventContextProtocolOneBuilder {
    pub fn error_event_fields(mut self, value: ErrorEvent) -> Self {
        self.error_event_fields = Some(value);
        self
    }

    pub fn event(mut self, value: StreamEventContextProtocolOneEvent) -> Self {
        self.event = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamEventContextProtocolOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`error_event_fields`](StreamEventContextProtocolOneBuilder::error_event_fields)
    /// - [`event`](StreamEventContextProtocolOneBuilder::event)
    pub fn build(self) -> Result<StreamEventContextProtocolOne, BuildError> {
        Ok(StreamEventContextProtocolOne {
            error_event_fields: self.error_event_fields.ok_or_else(|| BuildError::missing_field("error_event_fields"))?,
            event: self.event.ok_or_else(|| BuildError::missing_field("event"))?,
        })
    }
}
