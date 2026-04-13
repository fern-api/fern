pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwelveType {
    #[serde(rename = "primaryBlock")]
    PrimaryBlock,
}
impl fmt::Display for BigUnionTwelveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::PrimaryBlock => "primaryBlock",
        };
        write!(f, "{}", s)
    }
}
