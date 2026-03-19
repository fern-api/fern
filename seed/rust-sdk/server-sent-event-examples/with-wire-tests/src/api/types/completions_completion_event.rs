pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompletionEvent {
    #[serde(default)]
    pub content: String,
}
