pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
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
}
