pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionNineteenType {
    #[serde(rename = "uniqueStress")]
    UniqueStress,
}
impl fmt::Display for BigUnionNineteenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::UniqueStress => "uniqueStress",
        };
        write!(f, "{}", s)
    }
}
