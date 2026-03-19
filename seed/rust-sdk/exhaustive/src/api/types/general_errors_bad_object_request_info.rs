pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BadObjectRequestInfo {
    #[serde(default)]
    pub message: String,
}
