pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionEightType {
    #[serde(rename = "vibrantExcitement")]
    VibrantExcitement,
}
impl fmt::Display for BigUnionEightType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::VibrantExcitement => "vibrantExcitement",
        };
        write!(f, "{}", s)
    }
}
