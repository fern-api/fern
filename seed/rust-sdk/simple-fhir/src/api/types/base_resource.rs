pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BaseResource {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub related_resources: Vec<ResourceList>,
    #[serde(default)]
    pub memo: Memo,
}
