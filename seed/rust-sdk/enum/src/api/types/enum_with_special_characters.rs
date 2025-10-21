pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum EnumWithSpecialCharacters {
    #[serde(rename = "\\$bla")]
    Bla,
    #[serde(rename = "\\$yo")]
    Yo,
}
impl fmt::Display for EnumWithSpecialCharacters {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Bla => "\\$bla",
            Self::Yo => "\\$yo",
        };
        write!(f, "{}", s)
    }
}
