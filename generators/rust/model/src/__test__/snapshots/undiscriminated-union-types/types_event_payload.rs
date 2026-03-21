pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct EventPayload {
    pub r#type: EventType,
}

impl EventPayload {
    pub fn builder() -> EventPayloadBuilder {
        EventPayloadBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EventPayloadBuilder {
    r#type: Option<EventType>,
}

impl EventPayloadBuilder {
    pub fn r#type(mut self, value: EventType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EventPayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](EventPayloadBuilder::r#type)
    pub fn build(self) -> Result<EventPayload, BuildError> {
        Ok(EventPayload {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
