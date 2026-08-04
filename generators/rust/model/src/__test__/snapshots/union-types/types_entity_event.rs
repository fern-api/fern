pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EntityEvent {
    #[serde(default)]
    pub time: String,
    #[serde(default)]
    pub entity: StreamEntity,
}

impl EntityEvent {
    pub fn builder() -> EntityEventBuilder {
        <EntityEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EntityEventBuilder {
    time: Option<String>,
    entity: Option<StreamEntity>,
}

impl EntityEventBuilder {
    pub fn time(mut self, value: impl Into<String>) -> Self {
        self.time = Some(value.into());
        self
    }

    pub fn entity(mut self, value: StreamEntity) -> Self {
        self.entity = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EntityEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`time`](EntityEventBuilder::time)
    /// - [`entity`](EntityEventBuilder::entity)
    pub fn build(self) -> Result<EntityEvent, BuildError> {
        Ok(EntityEvent {
            time: self.time.ok_or_else(|| BuildError::missing_field("time"))?,
            entity: self.entity.ok_or_else(|| BuildError::missing_field("entity"))?,
        })
    }
}
