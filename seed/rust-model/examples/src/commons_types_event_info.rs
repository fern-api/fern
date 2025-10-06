pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CommonsTypesEventInfo {
        Metadata {
            #[serde(flatten)]
            data: CommonsTypesMetadata,
        },

        Tag {
            value: CommonsTypesTag,
        },
}
