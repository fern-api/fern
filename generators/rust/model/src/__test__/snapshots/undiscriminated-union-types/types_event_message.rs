pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum EventMessage {
        #[serde(rename = "payload")]
        Payload {
            #[serde(flatten)]
            data: EventPayload,
        },

        #[serde(rename = "raw")]
        Raw {
            value: String,
        },
}
