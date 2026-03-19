pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ErrorBody {
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    pub code: i64,
}