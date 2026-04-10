pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithDuplicativeDiscriminantsZeroType {
    #[serde(rename = "firstItemType")]
    FirstItemType,
}
impl fmt::Display for UnionWithDuplicativeDiscriminantsZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::FirstItemType => "firstItemType",
        };
        write!(f, "{}", s)
    }
}
