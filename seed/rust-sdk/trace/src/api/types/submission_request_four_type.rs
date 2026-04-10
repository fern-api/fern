pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SubmissionRequestFourType {
    #[serde(rename = "stop")]
    Stop,
}
impl fmt::Display for SubmissionRequestFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Stop => "stop",
        };
        write!(f, "{}", s)
    }
}
