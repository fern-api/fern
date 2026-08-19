pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DataContextHeartbeat {
    #[serde(flatten)]
    pub heartbeat_payload_fields: HeartbeatPayload,
}

impl DataContextHeartbeat {
    pub fn builder() -> DataContextHeartbeatBuilder {
        <DataContextHeartbeatBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DataContextHeartbeatBuilder {
    heartbeat_payload_fields: Option<HeartbeatPayload>,
}

impl DataContextHeartbeatBuilder {
    pub fn heartbeat_payload_fields(mut self, value: HeartbeatPayload) -> Self {
        self.heartbeat_payload_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DataContextHeartbeat`].
    /// This method will fail if any of the following fields are not set:
    /// - [`heartbeat_payload_fields`](DataContextHeartbeatBuilder::heartbeat_payload_fields)
    pub fn build(self) -> Result<DataContextHeartbeat, BuildError> {
        Ok(DataContextHeartbeat {
            heartbeat_payload_fields: self
                .heartbeat_payload_fields
                .ok_or_else(|| BuildError::missing_field("heartbeat_payload_fields"))?,
        })
    }
}
