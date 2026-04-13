pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionFifteenType {
    #[serde(rename = "disloyalValue")]
    DisloyalValue,
}
impl fmt::Display for BigUnionFifteenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::DisloyalValue => "disloyalValue",
        };
        write!(f, "{}", s)
    }
}
