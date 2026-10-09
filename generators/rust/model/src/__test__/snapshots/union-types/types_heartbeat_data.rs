pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct HeartbeatData {
    #[serde(default)]
    pub timestamp: String,
}

impl HeartbeatData {
    pub fn builder() -> HeartbeatDataBuilder {
        <HeartbeatDataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct HeartbeatDataBuilder {
    timestamp: Option<String>,
}

impl HeartbeatDataBuilder {
    pub fn timestamp(mut self, value: impl Into<String>) -> Self {
        self.timestamp = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`HeartbeatData`].
    /// This method will fail if any of the following fields are not set:
    /// - [`timestamp`](HeartbeatDataBuilder::timestamp)
    pub fn build(self) -> Result<HeartbeatData, BuildError> {
        Ok(HeartbeatData {
            timestamp: self.timestamp.ok_or_else(|| BuildError::missing_field("timestamp"))?,
        })
    }
}
