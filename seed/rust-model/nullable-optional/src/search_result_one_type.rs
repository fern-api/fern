pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SearchResultOneType {
    #[serde(rename = "organization")]
    Organization,
}
impl fmt::Display for SearchResultOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Organization => "organization",
        };
        write!(f, "{}", s)
    }
}
