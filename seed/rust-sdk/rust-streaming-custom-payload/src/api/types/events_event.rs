pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Event {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl Event {
    pub fn builder() -> EventBuilder {
        <EventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EventBuilder {
    id: Option<String>,
    message: Option<String>,
}

impl EventBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Event`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](EventBuilder::id)
    pub fn build(self) -> Result<Event, BuildError> {
        Ok(Event {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            message: self.message,
        })
    }
}
