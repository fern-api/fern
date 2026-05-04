pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ObjectPayloadWithEventField {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    /// An event type field inside the data payload that collides with the SSE envelope's event field used for discrimination.
    #[serde(default)]
    pub event: String,
}

impl ObjectPayloadWithEventField {
    pub fn builder() -> ObjectPayloadWithEventFieldBuilder {
        <ObjectPayloadWithEventFieldBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ObjectPayloadWithEventFieldBuilder {
    id: Option<String>,
    name: Option<String>,
    event: Option<String>,
}

impl ObjectPayloadWithEventFieldBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn event(mut self, value: impl Into<String>) -> Self {
        self.event = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ObjectPayloadWithEventField`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](ObjectPayloadWithEventFieldBuilder::id)
    /// - [`name`](ObjectPayloadWithEventFieldBuilder::name)
    /// - [`event`](ObjectPayloadWithEventFieldBuilder::event)
    pub fn build(self) -> Result<ObjectPayloadWithEventField, BuildError> {
        Ok(ObjectPayloadWithEventField {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            event: self
                .event
                .ok_or_else(|| BuildError::missing_field("event"))?,
        })
    }
}
