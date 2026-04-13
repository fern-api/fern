pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SearchResultTwoType {
    #[serde(rename = "document")]
    Document,
}
impl fmt::Display for SearchResultTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Document => "document",
        };
        write!(f, "{}", s)
    }
}
