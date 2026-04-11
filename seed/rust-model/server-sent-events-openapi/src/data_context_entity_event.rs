pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DataContextEntityEvent {
    #[serde(flatten)]
    pub entity_event_payload_fields: EntityEventPayload,
}

impl DataContextEntityEvent {
    pub fn builder() -> DataContextEntityEventBuilder {
        <DataContextEntityEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DataContextEntityEventBuilder {
    entity_event_payload_fields: Option<EntityEventPayload>,
}

impl DataContextEntityEventBuilder {
    pub fn entity_event_payload_fields(mut self, value: EntityEventPayload) -> Self {
        self.entity_event_payload_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DataContextEntityEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`entity_event_payload_fields`](DataContextEntityEventBuilder::entity_event_payload_fields)
    pub fn build(self) -> Result<DataContextEntityEvent, BuildError> {
        Ok(DataContextEntityEvent {
            entity_event_payload_fields: self.entity_event_payload_fields.ok_or_else(|| BuildError::missing_field("entity_event_payload_fields"))?,
        })
    }
}
