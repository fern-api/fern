pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PropertyBasedErrorTestBody {
    #[serde(default)]
    pub message: String,
}