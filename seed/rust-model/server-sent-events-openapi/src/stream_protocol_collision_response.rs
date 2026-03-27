pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "event")]
pub enum StreamProtocolCollisionResponse {
        #[serde(rename = "heartbeat")]
        #[non_exhaustive]
        Heartbeat {
            #[serde(flatten)]
            data: ProtocolHeartbeat,
        },

        #[serde(rename = "string_data")]
        #[non_exhaustive]
        StringData {
            #[serde(flatten)]
            data: ProtocolStringEvent,
        },

        #[serde(rename = "number_data")]
        #[non_exhaustive]
        NumberData {
            #[serde(flatten)]
            data: ProtocolNumberEvent,
        },

        #[serde(rename = "object_data")]
        #[non_exhaustive]
        ObjectData {
            #[serde(default)]
            data: ObjectPayloadWithEventField,
        },
}

impl StreamProtocolCollisionResponse {
    pub fn heartbeat(data: ProtocolHeartbeat) -> Self {
        Self::Heartbeat { data }
    }

    pub fn string_data(data: ProtocolStringEvent) -> Self {
        Self::StringData { data }
    }

    pub fn number_data(data: ProtocolNumberEvent) -> Self {
        Self::NumberData { data }
    }

    pub fn object_data(data: ObjectPayloadWithEventField) -> Self {
        Self::ObjectData { data }
    }
}
