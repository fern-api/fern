pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum StreamXFernStreamingUnionRequest {
        #[serde(rename = "message")]
        #[non_exhaustive]
        Message {
            #[serde(flatten)]
            data: UnionStreamMessageVariant,
            stream_response: bool,
        },

        #[serde(rename = "interrupt")]
        #[non_exhaustive]
        Interrupt {
            #[serde(flatten)]
            data: UnionStreamInterruptVariant,
            stream_response: bool,
        },

        #[serde(rename = "compact")]
        #[non_exhaustive]
        Compact {
            #[serde(flatten)]
            data: UnionStreamCompactVariant,
            stream_response: bool,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl StreamXFernStreamingUnionRequest {
    pub fn message(data: UnionStreamMessageVariant, stream_response: bool) -> Self {
        Self::Message { data, stream_response }
    }

    pub fn interrupt(data: UnionStreamInterruptVariant, stream_response: bool) -> Self {
        Self::Interrupt { data, stream_response }
    }

    pub fn compact(data: UnionStreamCompactVariant, stream_response: bool) -> Self {
        Self::Compact { data, stream_response }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }

    pub fn get_stream_response(&self) -> &bool {
        match self {
                    Self::Message { stream_response, .. } => stream_response,
                    Self::Interrupt { stream_response, .. } => stream_response,
                    Self::Compact { stream_response, .. } => stream_response,
                    Self::__Unknown(_) => panic!("get_stream_response() called on __Unknown variant; inspect the raw JSON value directly"),
                }
    }
}
