pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamEventZero {
    #[serde(flatten)]
    pub completion_event_fields: CompletionEvent,
    pub event: StreamEventZeroEvent,
}

impl StreamEventZero {
    pub fn builder() -> StreamEventZeroBuilder {
        <StreamEventZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamEventZeroBuilder {
    completion_event_fields: Option<CompletionEvent>,
    event: Option<StreamEventZeroEvent>,
}

impl StreamEventZeroBuilder {
    pub fn completion_event_fields(mut self, value: CompletionEvent) -> Self {
        self.completion_event_fields = Some(value);
        self
    }

    pub fn event(mut self, value: StreamEventZeroEvent) -> Self {
        self.event = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StreamEventZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`completion_event_fields`](StreamEventZeroBuilder::completion_event_fields)
    /// - [`event`](StreamEventZeroBuilder::event)
    pub fn build(self) -> Result<StreamEventZero, BuildError> {
        Ok(StreamEventZero {
            completion_event_fields: self.completion_event_fields.ok_or_else(|| BuildError::missing_field("completion_event_fields"))?,
            event: self.event.ok_or_else(|| BuildError::missing_field("event"))?,
        })
    }
}
