pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamEventContextProtocolZero {
    #[serde(flatten)]
    pub completion_event_fields: CompletionEvent,
    pub event: StreamEventContextProtocolZeroEvent,
}

impl StreamEventContextProtocolZero {
    pub fn builder() -> StreamEventContextProtocolZeroBuilder {
        <StreamEventContextProtocolZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamEventContextProtocolZeroBuilder {
    completion_event_fields: Option<CompletionEvent>,
    event: Option<StreamEventContextProtocolZeroEvent>,
}

impl StreamEventContextProtocolZeroBuilder {
    pub fn completion_event_fields(mut self, value: CompletionEvent) -> Self {
        self.completion_event_fields = Some(value);
        self
    }

    pub fn event(mut self, value: StreamEventContextProtocolZeroEvent) -> Self {
        self.event = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamEventContextProtocolZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`completion_event_fields`](StreamEventContextProtocolZeroBuilder::completion_event_fields)
    /// - [`event`](StreamEventContextProtocolZeroBuilder::event)
    pub fn build(self) -> Result<StreamEventContextProtocolZero, BuildError> {
        Ok(StreamEventContextProtocolZero {
            completion_event_fields: self.completion_event_fields.ok_or_else(|| BuildError::missing_field("completion_event_fields"))?,
            event: self.event.ok_or_else(|| BuildError::missing_field("event"))?,
        })
    }
}
