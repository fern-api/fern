pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlinedChildRequest {
    #[serde(default)]
    pub child: String,
    #[serde(default)]
    pub parent: String,
}
