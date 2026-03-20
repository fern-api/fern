pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamCompletionRequestWithoutTerminator {
    #[serde(default)]
    pub query: String,
}
