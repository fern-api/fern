pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum EventInfo {
        #[serde(rename = "metadata")]
        Metadata {
            #[serde(flatten)]
            data: Metadata,
        },

        #[serde(rename = "tag")]
        Tag {
            value: Tag,
        },
}
