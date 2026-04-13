pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwentyOneType {
    #[serde(rename = "frozenSleep")]
    FrozenSleep,
}
impl fmt::Display for BigUnionTwentyOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::FrozenSleep => "frozenSleep",
        };
        write!(f, "{}", s)
    }
}
