pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AstllmNodeWithPromptType {
    #[serde(rename = "llm")]
    Llm,
}
impl fmt::Display for AstllmNodeWithPromptType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Llm => "llm",
        };
        write!(f, "{}", s)
    }
}
