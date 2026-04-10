pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum StreamEventZeroEvent {
    #[serde(rename = "completion")]
    Completion,
}
impl fmt::Display for StreamEventZeroEvent {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Completion => "completion",
        };
        write!(f, "{}", s)
    }
}
