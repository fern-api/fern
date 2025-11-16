pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DeployParams {
    #[serde(rename = "updateDraft")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub update_draft: Option<bool>,
}
