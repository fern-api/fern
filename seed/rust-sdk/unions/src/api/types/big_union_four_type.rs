pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionFourType {
    #[serde(rename = "mistySnow")]
    MistySnow,
}
impl fmt::Display for BigUnionFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::MistySnow => "mistySnow",
        };
        write!(f, "{}", s)
    }
}
