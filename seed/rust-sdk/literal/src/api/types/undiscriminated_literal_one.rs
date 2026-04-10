pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UndiscriminatedLiteralOne {
    #[serde(rename = "$ending")]
    Ending,
}
impl fmt::Display for UndiscriminatedLiteralOne {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Ending => "$ending",
        };
        write!(f, "{}", s)
    }
}
