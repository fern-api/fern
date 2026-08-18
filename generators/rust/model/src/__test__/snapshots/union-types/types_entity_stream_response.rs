pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "event")]
#[non_exhaustive]
pub enum EntityStreamResponse {
        #[serde(rename = "heartbeat")]
        #[non_exhaustive]
        Heartbeat {
            #[serde(flatten)]
            data: EntityStreamHeartbeat,
        },

        #[serde(rename = "entity")]
        #[non_exhaustive]
        Entity {
            #[serde(flatten)]
            data: EntityStreamEvent,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl EntityStreamResponse {
    pub fn heartbeat(data: EntityStreamHeartbeat) -> Self {
        Self::Heartbeat { data }
    }

    pub fn entity(data: EntityStreamEvent) -> Self {
        Self::Entity { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
