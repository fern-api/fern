pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwentyEightType {
    #[serde(rename = "gaseousRoad")]
    GaseousRoad,
}
impl fmt::Display for BigUnionTwentyEightType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::GaseousRoad => "gaseousRoad",
        };
        write!(f, "{}", s)
    }
}
