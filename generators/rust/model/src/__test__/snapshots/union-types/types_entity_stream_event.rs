pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EntityStreamEvent {
    #[serde(flatten)]
    pub entity_event_fields: EntityEvent,
}

impl EntityStreamEvent {
    pub fn builder() -> EntityStreamEventBuilder {
        <EntityStreamEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EntityStreamEventBuilder {
    entity_event_fields: Option<EntityEvent>,
}

impl EntityStreamEventBuilder {
    pub fn entity_event_fields(mut self, value: EntityEvent) -> Self {
        self.entity_event_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EntityStreamEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`entity_event_fields`](EntityStreamEventBuilder::entity_event_fields)
    pub fn build(self) -> Result<EntityStreamEvent, BuildError> {
        Ok(EntityStreamEvent {
            entity_event_fields: self.entity_event_fields.ok_or_else(|| BuildError::missing_field("entity_event_fields"))?,
        })
    }
}
