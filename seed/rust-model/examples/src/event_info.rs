use serde::{Deserialize, Serialize};
use crate::metadata::Metadata;
use crate::tag::Tag;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum EventInfo {
        Metadata {
            #[serde(flatten)]
            data: Metadata,
        },

        Tag {
            value: Tag,
        },
}
