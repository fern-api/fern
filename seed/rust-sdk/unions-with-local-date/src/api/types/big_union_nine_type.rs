pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionNineType {
    #[serde(rename = "activeDiamond")]
    ActiveDiamond,
}
impl fmt::Display for BigUnionNineType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ActiveDiamond => "activeDiamond",
        };
        write!(f, "{}", s)
    }
}
