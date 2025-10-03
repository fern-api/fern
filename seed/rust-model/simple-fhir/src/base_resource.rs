pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BaseResource {
    pub id: String,
    pub related_resources: Vec<ResourceList>,
    pub memo: Memo,
}