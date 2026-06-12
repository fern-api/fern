pub use crate::prelude::*;
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "event")]
#[non_exhaustive]
pub enum StreamProtocolWithFlatSchemaResponse {
        #[serde(rename = "heartbeat")]
        #[non_exhaustive]
        Heartbeat {
            #[serde(flatten)]
            data: DataContextHeartbeat,
        },

        #[serde(rename = "entity")]
        #[non_exhaustive]
        Entity {
            #[serde(flatten)]
            data: DataContextEntityEvent,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl StreamProtocolWithFlatSchemaResponse {
    pub fn heartbeat(data: DataContextHeartbeat) -> Self {
        Self::Heartbeat { data }
    }

    pub fn entity(data: DataContextEntityEvent) -> Self {
        Self::Entity { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
