pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionStreamRequest {
        #[serde(rename = "message")]
        #[non_exhaustive]
        Message {
            #[serde(flatten)]
            data: UnionStreamMessageVariant,
        },

        #[serde(rename = "interrupt")]
        #[non_exhaustive]
        Interrupt {
            #[serde(flatten)]
            data: UnionStreamInterruptVariant,
        },

        #[serde(rename = "compact")]
        #[non_exhaustive]
        Compact {
            #[serde(flatten)]
            data: UnionStreamCompactVariant,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl UnionStreamRequest {
    pub fn message(data: UnionStreamMessageVariant) -> Self {
        Self::Message { data }
    }

    pub fn interrupt(data: UnionStreamInterruptVariant) -> Self {
        Self::Interrupt { data }
    }

    pub fn compact(data: UnionStreamCompactVariant) -> Self {
        Self::Compact { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
