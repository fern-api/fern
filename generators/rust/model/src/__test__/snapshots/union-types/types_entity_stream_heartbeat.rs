pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct EntityStreamHeartbeat {
    #[serde(flatten)]
    pub heartbeat_data_fields: HeartbeatData,
}

impl EntityStreamHeartbeat {
    pub fn builder() -> EntityStreamHeartbeatBuilder {
        <EntityStreamHeartbeatBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EntityStreamHeartbeatBuilder {
    heartbeat_data_fields: Option<HeartbeatData>,
}

impl EntityStreamHeartbeatBuilder {
    pub fn heartbeat_data_fields(mut self, value: HeartbeatData) -> Self {
        self.heartbeat_data_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`EntityStreamHeartbeat`].
    /// This method will fail if any of the following fields are not set:
    /// - [`heartbeat_data_fields`](EntityStreamHeartbeatBuilder::heartbeat_data_fields)
    pub fn build(self) -> Result<EntityStreamHeartbeat, BuildError> {
        Ok(EntityStreamHeartbeat {
            heartbeat_data_fields: self.heartbeat_data_fields.ok_or_else(|| BuildError::missing_field("heartbeat_data_fields"))?,
        })
    }
}
