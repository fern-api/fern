pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum EventMessage {
        #[serde(rename = "payload")]
        #[non_exhaustive]
        Payload {
            r#type: EventType,
        },

        #[serde(rename = "raw")]
        #[non_exhaustive]
        Raw {
            value: String,
        },
}

impl EventMessage {
    pub fn payload(r#type: EventType) -> Self {
        Self::Payload { r#type }
    }

    pub fn raw(value: String) -> Self {
        Self::Raw { value }
    }
}
