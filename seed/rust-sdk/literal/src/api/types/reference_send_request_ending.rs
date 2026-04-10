pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SendRequestEnding {
    #[serde(rename = "$ending")]
    Ending,
}
impl fmt::Display for SendRequestEnding {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Ending => "$ending",
        };
        write!(f, "{}", s)
    }
}
