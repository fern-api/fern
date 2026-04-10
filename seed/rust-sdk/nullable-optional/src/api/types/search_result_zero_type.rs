pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SearchResultZeroType {
    #[serde(rename = "user")]
    User,
}
impl fmt::Display for SearchResultZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::User => "user",
        };
        write!(f, "{}", s)
    }
}
