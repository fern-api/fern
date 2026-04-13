pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionFiveType {
    #[serde(rename = "distinctFailure")]
    DistinctFailure,
}
impl fmt::Display for BigUnionFiveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::DistinctFailure => "distinctFailure",
        };
        write!(f, "{}", s)
    }
}
