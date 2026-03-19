pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Request {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub union: Option<MetadataUnion>,
}