pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwentySevenType {
    #[serde(rename = "triangularRepair")]
    TriangularRepair,
}
impl fmt::Display for BigUnionTwentySevenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::TriangularRepair => "triangularRepair",
        };
        write!(f, "{}", s)
    }
}
