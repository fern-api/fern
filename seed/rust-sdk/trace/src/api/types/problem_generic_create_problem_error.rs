pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GenericCreateProblemError {
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    pub r#type: String,
    #[serde(default)]
    pub stacktrace: String,
}
