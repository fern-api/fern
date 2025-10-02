use crate::commons_types_metadata::Metadata;
use crate::commons_types_tag::Tag;
use serde::{Deserialize, Serialize};

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
