pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionEighteenType {
    #[serde(rename = "harmoniousPlay")]
    HarmoniousPlay,
}
impl fmt::Display for BigUnionEighteenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::HarmoniousPlay => "harmoniousPlay",
        };
        write!(f, "{}", s)
    }
}
