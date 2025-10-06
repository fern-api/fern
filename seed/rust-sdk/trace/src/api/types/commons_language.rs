pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CommonsLanguage {
    #[serde(rename = "JAVA")]
    Java,
    #[serde(rename = "JAVASCRIPT")]
    Javascript,
    #[serde(rename = "PYTHON")]
    Python,
}
impl fmt::Display for CommonsLanguage {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Java => "JAVA",
            Self::Javascript => "JAVASCRIPT",
            Self::Python => "PYTHON",
        };
        write!(f, "{}", s)
    }
}
