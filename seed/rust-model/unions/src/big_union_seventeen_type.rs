pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionSeventeenType {
    #[serde(rename = "totalWork")]
    TotalWork,
}
impl fmt::Display for BigUnionSeventeenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::TotalWork => "totalWork",
        };
        write!(f, "{}", s)
    }
}
