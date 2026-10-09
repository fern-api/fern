pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
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

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl EventMessage {
    pub fn payload(r#type: EventType) -> Self {
        Self::Payload { r#type }
    }

    pub fn raw(value: String) -> Self {
        Self::Raw { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
