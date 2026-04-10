pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionThirteenType {
    #[serde(rename = "rotatingRatio")]
    RotatingRatio,
}
impl fmt::Display for BigUnionThirteenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::RotatingRatio => "rotatingRatio",
        };
        write!(f, "{}", s)
    }
}
