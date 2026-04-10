pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EventEvent {
    #[serde(default)]
    pub event: String,
    #[serde(default)]
    pub name: String,
}

impl EventEvent {
    pub fn builder() -> EventEventBuilder {
        <EventEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EventEventBuilder {
    event: Option<String>,
    name: Option<String>,
}

impl EventEventBuilder {
    pub fn event(mut self, value: impl Into<String>) -> Self {
        self.event = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`EventEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`event`](EventEventBuilder::event)
    /// - [`name`](EventEventBuilder::name)
    pub fn build(self) -> Result<EventEvent, BuildError> {
        Ok(EventEvent {
            event: self
                .event
                .ok_or_else(|| BuildError::missing_field("event"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
