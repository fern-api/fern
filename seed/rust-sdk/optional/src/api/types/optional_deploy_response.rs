pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DeployResponse {
    #[serde(default)]
    pub success: bool,
}
