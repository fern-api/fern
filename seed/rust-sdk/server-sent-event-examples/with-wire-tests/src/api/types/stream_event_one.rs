pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamEventOne {
    #[serde(flatten)]
    pub error_event_fields: ErrorEvent,
    pub event: StreamEventOneEvent,
}

impl StreamEventOne {
    pub fn builder() -> StreamEventOneBuilder {
        <StreamEventOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamEventOneBuilder {
    error_event_fields: Option<ErrorEvent>,
    event: Option<StreamEventOneEvent>,
}

impl StreamEventOneBuilder {
    pub fn error_event_fields(mut self, value: ErrorEvent) -> Self {
        self.error_event_fields = Some(value);
        self
    }

    pub fn event(mut self, value: StreamEventOneEvent) -> Self {
        self.event = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamEventOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`error_event_fields`](StreamEventOneBuilder::error_event_fields)
    /// - [`event`](StreamEventOneBuilder::event)
    pub fn build(self) -> Result<StreamEventOne, BuildError> {
        Ok(StreamEventOne {
            error_event_fields: self
                .error_event_fields
                .ok_or_else(|| BuildError::missing_field("error_event_fields"))?,
            event: self
                .event
                .ok_or_else(|| BuildError::missing_field("event"))?,
        })
    }
}
