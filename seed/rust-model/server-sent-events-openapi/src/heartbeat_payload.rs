pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct HeartbeatPayload {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub timestamp: Option<DateTime<FixedOffset>>,
}

impl HeartbeatPayload {
    pub fn builder() -> HeartbeatPayloadBuilder {
        <HeartbeatPayloadBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct HeartbeatPayloadBuilder {
    timestamp: Option<DateTime<FixedOffset>>,
}

impl HeartbeatPayloadBuilder {
    pub fn timestamp(mut self, value: DateTime<FixedOffset>) -> Self {
        self.timestamp = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`HeartbeatPayload`].
    pub fn build(self) -> Result<HeartbeatPayload, BuildError> {
        Ok(HeartbeatPayload {
            timestamp: self.timestamp,
        })
    }
}
