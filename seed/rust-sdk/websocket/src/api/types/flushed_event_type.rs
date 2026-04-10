pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum FlushedEventType {
    #[serde(rename = "flushed")]
    Flushed,
}
impl fmt::Display for FlushedEventType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Flushed => "flushed",
        };
        write!(f, "{}", s)
    }
}
