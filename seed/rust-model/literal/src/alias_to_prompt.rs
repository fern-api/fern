pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AliasToPrompt {
    #[serde(rename = "You are a helpful assistant")]
    YouAreAHelpfulAssistant,
}
impl fmt::Display for AliasToPrompt {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::YouAreAHelpfulAssistant => "You are a helpful assistant",
        };
        write!(f, "{}", s)
    }
}
