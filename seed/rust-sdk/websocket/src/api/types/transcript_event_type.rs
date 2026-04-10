pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TranscriptEventType {
    #[serde(rename = "transcript")]
    Transcript,
}
impl fmt::Display for TranscriptEventType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Transcript => "transcript",
        };
        write!(f, "{}", s)
    }
}
