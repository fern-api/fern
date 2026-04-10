pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum InvalidRequestCauseTwoType {
    #[serde(rename = "unexpectedLanguage")]
    UnexpectedLanguage,
}
impl fmt::Display for InvalidRequestCauseTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::UnexpectedLanguage => "unexpectedLanguage",
        };
        write!(f, "{}", s)
    }
}
