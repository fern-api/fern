pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EntityEventPayload {
    #[serde(rename = "entityId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity_id: Option<String>,
    #[serde(rename = "eventType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_type: Option<EntityEventPayloadEventType>,
    #[serde(rename = "updatedTime")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub updated_time: Option<DateTime<FixedOffset>>,
}

impl EntityEventPayload {
    pub fn builder() -> EntityEventPayloadBuilder {
        <EntityEventPayloadBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EntityEventPayloadBuilder {
    entity_id: Option<String>,
    event_type: Option<EntityEventPayloadEventType>,
    updated_time: Option<DateTime<FixedOffset>>,
}

impl EntityEventPayloadBuilder {
    pub fn entity_id(mut self, value: impl Into<String>) -> Self {
        self.entity_id = Some(value.into());
        self
    }

    pub fn event_type(mut self, value: EntityEventPayloadEventType) -> Self {
        self.event_type = Some(value);
        self
    }

    pub fn updated_time(mut self, value: DateTime<FixedOffset>) -> Self {
        self.updated_time = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EntityEventPayload`].
    pub fn build(self) -> Result<EntityEventPayload, BuildError> {
        Ok(EntityEventPayload {
            entity_id: self.entity_id,
            event_type: self.event_type,
            updated_time: self.updated_time,
        })
    }
}
