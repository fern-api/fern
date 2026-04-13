pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum StreamXFernStreamingUnionStreamRequest {
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
}

impl StreamXFernStreamingUnionStreamRequest {
    pub fn message(data: UnionStreamMessageVariant, stream_response: bool) -> Self {
        Self::Message {
            data,
            stream_response,
        }
    }

    pub fn interrupt(data: UnionStreamInterruptVariant, stream_response: bool) -> Self {
        Self::Interrupt {
            data,
            stream_response,
        }
    }

    pub fn compact(data: UnionStreamCompactVariant, stream_response: bool) -> Self {
        Self::Compact {
            data,
            stream_response,
        }
    }

    pub fn get_stream_response(&self) -> &bool {
        match self {
            Self::Message {
                stream_response, ..
            } => stream_response,
            Self::Interrupt {
                stream_response, ..
            } => stream_response,
            Self::Compact {
                stream_response, ..
            } => stream_response,
        }
    }
}
