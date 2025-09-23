use crate::union__metadata_union::MetadataUnion;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Request {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub union: Option<MetadataUnion>,
}
