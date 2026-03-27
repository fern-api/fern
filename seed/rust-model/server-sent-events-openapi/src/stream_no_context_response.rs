pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "event")]
pub enum StreamNoContextResponse {
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
}

impl StreamNoContextResponse {
    pub fn heartbeat(data: DataContextHeartbeat) -> Self {
        Self::Heartbeat { data }
    }

    pub fn entity(data: DataContextEntityEvent) -> Self {
        Self::Entity { data }
    }
}
