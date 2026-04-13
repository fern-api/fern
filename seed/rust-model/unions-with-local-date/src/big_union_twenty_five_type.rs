pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionTwentyFiveType {
    #[serde(rename = "circularCard")]
    CircularCard,
}
impl fmt::Display for BigUnionTwentyFiveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::CircularCard => "circularCard",
        };
        write!(f, "{}", s)
    }
}
