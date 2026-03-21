pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Event {
    #[serde(default)]
    pub id: Id,
    #[serde(default)]
    pub name: String,
}

impl Event {
    pub fn builder() -> EventBuilder {
        EventBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EventBuilder {
    id: Option<Id>,
    name: Option<String>,
}

impl EventBuilder {
    pub fn id(mut self, value: Id) -> Self {
        self.id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Event`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](EventBuilder::id)
    /// - [`name`](EventBuilder::name)
    pub fn build(self) -> Result<Event, BuildError> {
        Ok(Event {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
