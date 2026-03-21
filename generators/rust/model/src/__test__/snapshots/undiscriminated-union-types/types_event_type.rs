pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum EventType {
    #[serde(rename = "text.delta")]
    TextDelta,
    #[serde(rename = "text.done")]
    TextDone,
    #[serde(rename = "error")]
    Error,
}
impl fmt::Display for EventType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::TextDelta => "text.delta",
            Self::TextDone => "text.done",
            Self::Error => "error",
        };
        write!(f, "{}", s)
    }
}
