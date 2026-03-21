pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum EventInfo {
        #[serde(rename = "metadata")]
        #[non_exhaustive]
        Metadata {
            #[serde(flatten)]
            data: Metadata,
        },

        #[serde(rename = "tag")]
        #[non_exhaustive]
        Tag {
            value: Tag,
        },
}

impl EventInfo {
    pub fn metadata(data: Metadata) -> Self {
        Self::Metadata { data }
    }

    pub fn tag(value: Tag) -> Self {
        Self::Tag { value }
    }
}
