pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwentyThreeType {
    #[serde(rename = "attractiveScript")]
    AttractiveScript,
}
impl fmt::Display for BigUnionTwentyThreeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::AttractiveScript => "attractiveScript",
        };
        write!(f, "{}", s)
    }
}
