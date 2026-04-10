pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithDuplicativeDiscriminantsOneType {
    #[serde(rename = "secondItemType")]
    SecondItemType,
}
impl fmt::Display for UnionWithDuplicativeDiscriminantsOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::SecondItemType => "secondItemType",
        };
        write!(f, "{}", s)
    }
}
