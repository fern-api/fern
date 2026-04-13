pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionZeroType {
    #[serde(rename = "normalSweet")]
    NormalSweet,
}
impl fmt::Display for BigUnionZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::NormalSweet => "normalSweet",
        };
        write!(f, "{}", s)
    }
}
