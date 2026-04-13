pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionFourteenType {
    #[serde(rename = "colorfulCover")]
    ColorfulCover,
}
impl fmt::Display for BigUnionFourteenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ColorfulCover => "colorfulCover",
        };
        write!(f, "{}", s)
    }
}
