pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwentyTwoType {
    #[serde(rename = "diligentDeal")]
    DiligentDeal,
}
impl fmt::Display for BigUnionTwentyTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::DiligentDeal => "diligentDeal",
        };
        write!(f, "{}", s)
    }
}
